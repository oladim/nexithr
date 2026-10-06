# Deploying to Netlify

If the deployed site loads but **doesn't connect to Supabase** (you can't log
in, everything behaves like the local demo), it's almost always one of the
three things below. Work through them in order.

## 1. Set the environment variables in Netlify

Netlify does **not** read your local `.env.local`. Add the variables in the
dashboard: **Site configuration → Environment variables → Add a variable**
(add each one, scope "All", same values you used locally):

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://YOUR-REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | the **anon public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | the **service_role** key (server-only secret) |
| `NEXT_PUBLIC_APP_URL` | recommended | your Netlify URL, e.g. `https://nexit.netlify.app` — used for links in emails |
| `RESEND_API_KEY`, `EMAIL_FROM` | optional | turn on notification emails |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | optional | real payments (mock otherwise) |
| `ANTHROPIC_API_KEY` | optional | real AI interview |
| `GOOGLE_*` | optional | real Google Meet links |

The two `NEXT_PUBLIC_…` values are what decide whether the app runs in real
(Supabase) mode or demo mode — if they're missing or misspelled, the site
silently falls back to demo mode.

## 2. Redeploy with a clear cache (this is the step people miss)

`NEXT_PUBLIC_*` variables are **inlined into the browser bundle at build time**,
not read live in the browser. So if you added them *after* your first deploy,
the already-built bundle still has empty values. Force a fresh build:

**Deploys → Trigger deploy → "Clear cache and deploy site".**

After it finishes, hard-refresh the site. To confirm the keys made it in: open
the deployed site, DevTools → Network, and check that requests go to
`YOUR-REF.supabase.co`. If they don't, the build still didn't see the vars —
recheck the names in step 1 (they must match exactly, including `NEXT_PUBLIC_`).

## 3. Allow your Netlify URL in Supabase Auth

So login redirects and email-confirmation links work on the live domain:

**Supabase dashboard → Authentication → URL Configuration**
- **Site URL**: your Netlify URL (`https://your-site.netlify.app`)
- **Redirect URLs**: add `https://your-site.netlify.app/**`
  (and `https://your-site.netlify.app/auth/callback`)

If you use a custom domain, add that too.

## 4. Make sure the Next.js runtime is active

This repo includes a `netlify.toml` that enables `@netlify/plugin-nextjs`,
which Netlify needs to run the API routes and the auth middleware. Netlify
normally auto-detects Next.js, but if your build log shows a plain static
deploy (no "Next.js Runtime" / functions), install the plugin from
**Integrations → search "Next.js" → enable**, then redeploy.

---

### Quick checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Netlify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Netlify
- [ ] Triggered **Clear cache and deploy site** *after* adding them
- [ ] Netlify URL added to Supabase Auth Site URL + Redirect URLs
- [ ] Build log shows the Next.js runtime / functions
