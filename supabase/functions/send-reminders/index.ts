// Supabase Edge Function to send email reminders for grants via SMTP
// Triggered manually from admin dashboard or via cron job

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SMTP Configuration Interface
interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

// Simple SMTP Email Sender using fetch
async function sendEmailSMTP(config: SMTPConfig, from: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    // For SMTP, we'll use a service like smtp2go API or similar
    // Since Deno Edge Functions don't have direct SMTP socket support,
    // we need to use an HTTP-based SMTP relay or API

    // Option 1: Use SMTP2GO API (they have an HTTP API)
    // Option 2: Use your hosting provider's email API
    // Option 3: Use a service like SendGrid, Mailgun, etc.

    // For now, we'll create a basic implementation using nodemailer-like approach
    // through an HTTP relay service

    const emailData = {
      from,
      to,
      subject,
      html,
    };

    // Create SMTP connection info for logging
    console.log(`Connecting to SMTP: ${config.host}:${config.port}`);
    console.log(`Sending email to: ${to}`);

    // Since Deno doesn't have native SMTP support in Edge Functions,
    // we'll need to use a workaround:
    // 1. Use an HTTP-to-SMTP gateway
    // 2. Use your email provider's API
    // 3. Use a service like SMTP2GO's API

    // For demonstration, return true for now
    // You'll need to implement your specific provider's API
    return true;
  } catch (error) {
    console.error('SMTP Error:', error);
    return false;
  }
}

interface EmailSubscription {
  id: string;
  email: string;
  name: string | null;
  subscription_type: string;
  categories: string[] | null;
  provinces: string[] | null;
  unsubscribe_token: string;
}

interface Grant {
  id: string;
  program_name: string;
  department: string;
  deadline: string | null;
  max_funding: number | null;
  category: string | null;
  province: string | null;
  url: string | null;
  description: string | null;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Email sending function using SMTP credentials
async function sendEmail(payload: EmailPayload, smtpConfig: SMTPConfig): Promise<boolean> {
  try {
    // For Deno Edge Functions, we need to use an HTTP-based SMTP relay
    // Direct SMTP connections are not supported in serverless environments
    // Using SMTP2GO's HTTP API as a gateway
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': smtpConfig.password, // Will use SMTP password as API key
      },
      body: JSON.stringify({
        sender: `Four Winds <${smtpConfig.username}>`,
        to: [payload.to],
        subject: payload.subject,
        html_body: payload.html,
        custom_headers: [
          {
            header: 'Reply-To',
            value: smtpConfig.username,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email via SMTP:', errorText);

      // Fallback: Try direct SMTP if available
      console.log('Attempting alternative delivery method...');
      return await sendEmailDirect(smtpConfig, payload);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Direct SMTP sending for environments that support it
async function sendEmailDirect(config: SMTPConfig, payload: EmailPayload): Promise<boolean> {
  try {
    // This is a simplified SMTP implementation
    // In production, you'd use a proper SMTP library
    console.log(`Attempting direct SMTP connection to ${config.host}:${config.port}`);
    console.log(`From: ${config.username}, To: ${payload.to}`);

    // Note: Direct TCP/SMTP connections are not supported in Deno Deploy Edge Functions
    // You'll need to use an HTTP-based email service
    console.warn('Direct SMTP not available in Edge Functions. Please use SMTP2GO or configure an HTTP-based email service.');

    return false;
  } catch (error) {
    console.error('Direct SMTP error:', error);
    return false;
  }
}

function formatCurrency(amount: number | null): string {
  if (!amount) return 'Variable';
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Ongoing';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generateDeadlineReminderEmail(subscriber: EmailSubscription, grants: Grant[], baseUrl: string): string {
  const grantsList = grants.map(grant => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px 0; color: #0d9488;">${grant.program_name}</h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${grant.department}</p>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">${grant.description ? grant.description.substring(0, 150) + '...' : 'No description available'}</p>
        <div style="display: flex; gap: 16px; font-size: 14px;">
          <span style="color: #dc2626; font-weight: bold;">Deadline: ${formatDate(grant.deadline)}</span>
          <span style="color: #059669;">Funding: ${formatCurrency(grant.max_funding)}</span>
        </div>
        ${grant.url ? `<a href="${grant.url}" style="color: #0d9488; text-decoration: none; font-size: 14px; margin-top: 8px; display: inline-block;">Learn more →</a>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Green Buffalo Grant Portal</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Deadline Reminder</p>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            ${subscriber.name ? `Hi ${subscriber.name},` : 'Hello,'}
          </p>

          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            The following grants have upcoming deadlines. Don't miss your opportunity to apply!
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            ${grantsList}
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${baseUrl}" style="background-color: #0d9488; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              View All Grants
            </a>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            You received this email because you subscribed to Green Buffalo grant updates.
          </p>
          <p style="margin: 0;">
            <a href="${baseUrl}/unsubscribe?token=${subscriber.unsubscribe_token}" style="color: #0d9488;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewGrantsEmail(subscriber: EmailSubscription, grants: Grant[], baseUrl: string): string {
  const grantsList = grants.map(grant => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 8px;">NEW</div>
        <h3 style="margin: 0 0 8px 0; color: #0d9488;">${grant.program_name}</h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${grant.department}</p>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">${grant.description ? grant.description.substring(0, 150) + '...' : 'No description available'}</p>
        <div style="font-size: 14px;">
          ${grant.deadline ? `<span style="color: #dc2626; margin-right: 16px;">Deadline: ${formatDate(grant.deadline)}</span>` : ''}
          <span style="color: #059669;">Funding: ${formatCurrency(grant.max_funding)}</span>
        </div>
        ${grant.url ? `<a href="${grant.url}" style="color: #0d9488; text-decoration: none; font-size: 14px; margin-top: 8px; display: inline-block;">Learn more →</a>` : ''}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Green Buffalo Grant Portal</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">New Grant Opportunities</p>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            ${subscriber.name ? `Hi ${subscriber.name},` : 'Hello,'}
          </p>

          <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
            Great news! We've found ${grants.length} new grant ${grants.length === 1 ? 'opportunity' : 'opportunities'} that may be a great fit for your community.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            ${grantsList}
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${baseUrl}" style="background-color: #0d9488; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Explore All Grants
            </a>
          </div>
        </div>

        <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            You received this email because you subscribed to Green Buffalo grant updates.
          </p>
          <p style="margin: 0;">
            <a href="${baseUrl}/unsubscribe?token=${subscriber.unsubscribe_token}" style="color: #0d9488;">
              Unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://greenbuffalo.ca';

    // SMTP Configuration from environment variables
    const smtpConfig: SMTPConfig = {
      host: Deno.env.get('SMTP_HOST') || 'smtp.fourwinds.ca',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || 'support@fourwinds.ca',
      password: Deno.env.get('SMTP_PASSWORD') || '',
      secure: Deno.env.get('SMTP_SECURE') === 'true',
    };

    if (!smtpConfig.password) {
      return new Response(
        JSON.stringify({ error: 'SMTP_PASSWORD not configured. Please set SMTP credentials in Supabase environment variables.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { type = 'deadline_reminders', daysAhead = 7, testEmail = null } = await req.json().catch(() => ({}));

    let emailsSent = 0;
    let emailsFailed = 0;
    const results: { email: string; success: boolean; error?: string }[] = [];

    if (type === 'deadline_reminders') {
      // Get grants with deadlines in the next X days
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data: upcomingGrants, error: grantsError } = await supabase
        .from('grants')
        .select('*')
        .gte('deadline', new Date().toISOString().split('T')[0])
        .lte('deadline', futureDate.toISOString().split('T')[0])
        .eq('is_active', true)
        .order('deadline', { ascending: true });

      if (grantsError) {
        throw grantsError;
      }

      if (!upcomingGrants || upcomingGrants.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No grants with upcoming deadlines', emailsSent: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get active subscribers for deadline reminders
      const { data: subscribers, error: subsError } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('is_active', true)
        .or('subscription_type.eq.all,subscription_type.eq.deadline_reminders');

      if (subsError) {
        throw subsError;
      }

      if (!subscribers || subscribers.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No subscribers for deadline reminders', emailsSent: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send emails to each subscriber
      for (const subscriber of subscribers) {
        // Filter grants based on subscriber preferences
        let relevantGrants = upcomingGrants;

        if (subscriber.categories && subscriber.categories.length > 0) {
          relevantGrants = relevantGrants.filter(g =>
            g.category && subscriber.categories.includes(g.category)
          );
        }

        if (subscriber.provinces && subscriber.provinces.length > 0) {
          relevantGrants = relevantGrants.filter(g =>
            g.province && subscriber.provinces.includes(g.province)
          );
        }

        if (relevantGrants.length === 0) continue;

        const html = generateDeadlineReminderEmail(subscriber, relevantGrants, baseUrl);
        const success = await sendEmail({
          to: testEmail || subscriber.email,
          subject: `🔔 ${relevantGrants.length} Grant${relevantGrants.length > 1 ? 's' : ''} with Upcoming Deadlines`,
          html,
        }, smtpConfig);

        if (success) {
          emailsSent++;
          // Log the email
          await supabase.from('email_send_log').insert({
            subscription_id: subscriber.id,
            email: subscriber.email,
            email_type: 'deadline_reminder',
            subject: `Deadline Reminder: ${relevantGrants.length} grant(s)`,
            grant_ids: relevantGrants.map(g => g.id),
            status: 'sent',
          });

          // Update last email sent
          await supabase
            .from('email_subscriptions')
            .update({ last_email_sent: new Date().toISOString() })
            .eq('id', subscriber.id);
        } else {
          emailsFailed++;
        }

        results.push({ email: subscriber.email, success });

        // If testing, only send one email
        if (testEmail) break;
      }
    } else if (type === 'new_grants') {
      // Get grants added in the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: newGrants, error: grantsError } = await supabase
        .from('grants')
        .select('*')
        .gte('created_at', weekAgo.toISOString())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (grantsError) {
        throw grantsError;
      }

      if (!newGrants || newGrants.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No new grants in the last week', emailsSent: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get active subscribers for new grants
      const { data: subscribers, error: subsError } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('is_active', true)
        .or('subscription_type.eq.all,subscription_type.eq.new_grants');

      if (subsError) {
        throw subsError;
      }

      if (!subscribers || subscribers.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No subscribers for new grants', emailsSent: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send emails to each subscriber
      for (const subscriber of subscribers) {
        // Filter grants based on subscriber preferences
        let relevantGrants = newGrants;

        if (subscriber.categories && subscriber.categories.length > 0) {
          relevantGrants = relevantGrants.filter(g =>
            g.category && subscriber.categories.includes(g.category)
          );
        }

        if (subscriber.provinces && subscriber.provinces.length > 0) {
          relevantGrants = relevantGrants.filter(g =>
            g.province && subscriber.provinces.includes(g.province)
          );
        }

        if (relevantGrants.length === 0) continue;

        const html = generateNewGrantsEmail(subscriber, relevantGrants, baseUrl);
        const success = await sendEmail({
          to: testEmail || subscriber.email,
          subject: `✨ ${relevantGrants.length} New Grant${relevantGrants.length > 1 ? 's' : ''} Available!`,
          html,
        }, smtpConfig);

        if (success) {
          emailsSent++;
          // Log the email
          await supabase.from('email_send_log').insert({
            subscription_id: subscriber.id,
            email: subscriber.email,
            email_type: 'new_grant',
            subject: `New Grants: ${relevantGrants.length} opportunity(s)`,
            grant_ids: relevantGrants.map(g => g.id),
            status: 'sent',
          });

          // Update last email sent
          await supabase
            .from('email_subscriptions')
            .update({ last_email_sent: new Date().toISOString() })
            .eq('id', subscriber.id);
        } else {
          emailsFailed++;
        }

        results.push({ email: subscriber.email, success });

        // If testing, only send one email
        if (testEmail) break;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        emailsFailed,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
