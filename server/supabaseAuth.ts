import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.SUPABASE_URL) {
  throw new Error("Environment variable SUPABASE_URL not provided");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Environment variable SUPABASE_SERVICE_ROLE_KEY not provided");
}

// Server-side Supabase client with service role for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular Supabase client for user operations
export const createSupabaseClient = (accessToken?: string) => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      }
    }
  );
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

async function upsertUser(user: any) {
  await storage.upsertUser({
    id: user.id,
    email: user.email,
    firstName: user.user_metadata?.first_name || null,
    lastName: user.user_metadata?.last_name || null,
    profileImageUrl: user.user_metadata?.avatar_url || null,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Auth callback endpoint - handles OAuth redirects
  app.post("/api/auth/callback", async (req, res) => {
    try {
      const { access_token, refresh_token } = req.body;

      if (!access_token) {
        return res.status(400).json({ message: "Access token required" });
      }

      // Verify the token and get user
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(access_token);

      if (error || !user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Store user in our database
      await upsertUser(user);

      // Store auth info in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        access_token,
        refresh_token,
      };

      res.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Auth callback error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    const sessionUser = (req.session as any).user;

    if (sessionUser?.access_token) {
      // Sign out from Supabase
      const supabase = createSupabaseClient(sessionUser.access_token);
      await supabase.auth.signOut();
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;

      if (!sessionUser?.refresh_token) {
        return res.status(401).json({ message: "No refresh token" });
      }

      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: sessionUser.refresh_token
      });

      if (error || !data.session) {
        return res.status(401).json({ message: "Token refresh failed" });
      }

      // Update session with new tokens
      (req.session as any).user = {
        id: data.user.id,
        email: data.user.email,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };

      res.json({
        success: true,
        access_token: data.session.access_token
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser?.access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token is still valid
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionUser.access_token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    (req as any).user = {
      claims: {
        sub: user.id,
        email: user.email,
      }
    };

    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
