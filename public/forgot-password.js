// Public fallback script to support legacy "onclick=forgotPassword()" handlers.
// Loads supabase from CDN (ESM) if possible and defines window.forgotPassword.

(async function () {
  // Replace these placeholders if you want to hard-code a project URL/key for static pages.
  // Prefer injecting via environment/CI for production builds.
  const SUPABASE_URL_PLACEHOLDER = 'https://YOUR_PROJECT_ID.supabase.co';
  const SUPABASE_ANON_KEY_PLACEHOLDER = 'YOUR_PUBLIC_ANON_KEY';

  let supabase = null;
  let createClient = null;

  // Try to import the official client from CDN (modern browsers only)
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    createClient = mod.createClient;
  } catch (err) {
    // Not fatal — we'll fall back to demo outbox
    console.warn('Could not load Supabase client from CDN, falling back to demo email outbox.', err);
  }

  // If someone replaced placeholders at build time, use them; otherwise treat as not configured
  const supabaseUrl = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : SUPABASE_URL_PLACEHOLDER;
  const supabaseKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : SUPABASE_ANON_KEY_PLACEHOLDER;

  if (createClient && supabaseUrl && !supabaseUrl.includes('YOUR_PROJECT_ID') && supabaseKey && !supabaseKey.includes('YOUR_PUBLIC_ANON_KEY')) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client; demo outbox will be used.', err);
      supabase = null;
    }
  }

  function getResetRedirect() {
    // Prefer the SPA hash route (works on GitHub Pages). Also include a static fallback for older setups.
    const base = window.location.origin + (window.location.pathname || '');
    const hashRoute = `${base.replace(/\/$/, '')}/# /reset-password`.replace('/# /', '/#/'); // ensure no double slashes
    const staticFallback = `${base.replace(/\/$/, '')}/reset-password.html`;
    // We prefer hash route — Supabase auth redirect supports either. Use hash route by default.
    return hashRoute || staticFallback;
  }

  // Define the global function used by legacy anchors
  window.forgotPassword = async function forgotPassword() {
    try {
      const emailInput = document.getElementById('login-email') || document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]');
      const email = emailInput && emailInput.value && emailInput.value.trim();

      if (!email) {
        alert('Please enter your email first');
        return;
      }

      // Prefer the SPA hash route (works reliably on GitHub Pages) as the redirect target
      const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
      const redirectTo = `${base}/#/reset-password`;

      if (supabase && supabase.auth && typeof supabase.auth.resetPasswordForEmail === 'function') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo
        });

        if (error) {
          alert(error.message || 'Failed to send reset email');
        } else {
          alert('Password reset email sent. Check your inbox.');
        }

        return;
      }

      // Demo fallback: store a demo email in localStorage so the debug page can show it
      const outboxRaw = localStorage.getItem('demo_email_outbox') || '[]';
      let outbox = [];
      try { outbox = JSON.parse(outboxRaw); } catch { outbox = []; }

      const token = Math.random().toString(36).slice(2);
      const link = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/#/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      const content = `<p>Hi,</p><p>Click the link to reset your password:</p><p><a href="${link}">${link}</a></p>`;

      outbox.push({ id: Date.now(), to: email, subject: 'Password reset', content });
      localStorage.setItem('demo_email_outbox', JSON.stringify(outbox));
      localStorage.setItem('last_demo_email_preview', JSON.stringify(outbox[outbox.length - 1]));

      alert('Password reset email sent (demo). Open the debug outbox to view the message.');
    } catch (err) {
      console.error('forgotPassword failed', err);
      alert('An unexpected error occurred. Check the console for details.');
    }
  };
})();
