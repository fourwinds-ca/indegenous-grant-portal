import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_FILES: Record<string, string> = {
  'admin': 'Admin-Training-Guide.pdf',
  'user': 'User-Quick-Start-Guide.pdf',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const filename = ALLOWED_FILES[file];
  if (!filename) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Extract bearer token from Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Verify the user's session with the service role client
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Confirm the email is in the admin_users allowlist
  const email = userData.user.email.toLowerCase();
  const { data: adminRow, error: adminErr } = await admin
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  if (adminErr || !adminRow) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Serve the PDF
  const filePath = path.join(process.cwd(), 'data', 'training', filename);
  try {
    const pdf = await fs.readFile(filePath);
    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    console.error('Failed to read training PDF:', e);
    return NextResponse.json({ error: 'File not available' }, { status: 500 });
  }
}
