Quick steps to enable real password reset emails with Supabase

1) Create a Supabase project (if you don't have one)
   - Note the Project URL (e.g., https://xxxxx.supabase.co) and anon key.

2) Create a 'send-email' Edge Function (optional)
   - The current project expects a Supabase Function named `send-email` that accepts a JSON body: { to, subject, content, replyTo }
   - The function can send email via SMTP/SendGrid/other provider. See Supabase docs for Edge Functions and SMTP/SendGrid examples.

3) Add repository secrets in GitHub
   - In your repository settings -> Secrets -> Actions add:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_ANON_KEY` = your anon/public key

4) Re-run CI / push to `master` branch
   - The GitHub Actions workflow will pick up these secrets and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time so the deployed site can use Supabase for sending emails.

Notes
- If you don't want to create an Edge Function, Supabase also supports `supabase.auth.resetPasswordForEmail` which will send the standard auth reset email if your project's email settings are configured.

5) Add your deployed reset URL to Supabase redirect settings
    - In your Supabase project dashboard go to **Authentication -> Settings -> Redirect URLs** and add the page(s) below so reset links are accepted:
       - `https://fanaticop.github.io/inventory-management-system/reset-password.html` (static redirect fallback)
       - `https://fanaticop.github.io/inventory-management-system/#/reset-password` (SPA hash route — used by the app when served on GitHub Pages)
    - Also set your **Site URL** to `https://fanaticop.github.io/inventory-management-system/` so links and redirects are allowed by Supabase.
    - Note: If Supabase refuses fragment (#) URLs in Redirect URLs, at minimum add the Site URL above and the static `reset-password.html` fallback.
- For local testing, you can set these values in a `.env` file (example: `VITE_SUPABASE_URL=...`, `VITE_SUPABASE_ANON_KEY=...`) and run `npm run build`/`npm run dev`.

4) (Optional) Deploy a `send-email` Edge Function to forward emails via SendGrid (recommended)
   - This project includes a sample function at `supabase/functions/send-email/index.ts` that uses SendGrid to send HTML emails.
   - Steps:
     1. Install the Supabase CLI and log in: `npm i -g supabase` then `supabase login`.
     2. From repo root, run: `supabase functions deploy send-email --project-ref <your-project-ref>` to deploy the function.
     3. Add function secrets in Supabase (in Dashboard or via CLI):
        - `SENDGRID_API_KEY` (your SendGrid API key)
        - `SENDGRID_FROM_EMAIL` (the `from` email you want to use)
     4. Test the function in the Supabase Dashboard or call from the app (the app already calls `supabase.functions.invoke('send-email', { body: ... })`).

Notes on alternatives:
 - Instead of an Edge Function, you can configure Supabase's built-in auth email settings (SMTP provider) in the Supabase dashboard to have Supabase send auth emails directly via your SMTP provider.
 - When you have real Supabase config and either SMTP or the `send-email` function ready, add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as GitHub secrets and push to `master` to have CI build with real email capability.
