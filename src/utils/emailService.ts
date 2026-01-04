import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables (optional)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  replyTo?: string;
}

export const sendEmail = async ({ to, subject, content, replyTo }: EmailOptions) => {
  try {
    // If Supabase is not configured (e.g., running on GitHub Pages demo), fallback to a local mock
    if (!supabase) {
      // Save the email to localStorage for demo/debugging so reset links can be inspected
      const outbox = JSON.parse(localStorage.getItem('demo_email_outbox' ) || '[]');
      outbox.push({ to, subject, content, replyTo, sentAt: new Date().toISOString() });
      localStorage.setItem('demo_email_outbox', JSON.stringify(outbox));
      console.info('EmailService: supabase not configured — saved email to demo_email_outbox', { to, subject });
      return { success: true, debug: { outboxKey: 'demo_email_outbox' } };
    }

    // Using Supabase's built-in email service
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        content,
        replyTo
      }
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const subject = 'Password Reset Request';
  const content = `
    <h2>Password Reset Request</h2>
    <p>You recently requested to reset your password. Click the link below to reset it:</p>
    <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 1 hour for security purposes.</p>
  `;

  return sendEmail({ to, subject, content });
};