# ✅ Domain Verification Checklist

## Current Status

Your domains are configured in Vercel:
- ✅ `www.loanaticks.com` - Configured
- ✅ `loanaticks.com` - Configured  
- ✅ `loanticks.vercel.app` - Configured

## Step 1: Test Your Domains

Try accessing these URLs in your browser:

1. **https://www.loanaticks.com** - Should work
2. **https://loanaticks.com** - Should work (may redirect to www)
3. **https://loanticks.vercel.app** - Should work

## Step 2: Check DNS Propagation

If domains don't load, check DNS:

1. **Visit:** https://dnschecker.org
2. **Enter:** `loanaticks.com`
3. **Check if it shows Vercel's IP addresses:**
   - Should show: `76.76.21.21` or `76.223.126.42`
   - Or CNAME: `cname.vercel-dns.com`

If DNS shows wrong IPs or old records, you need to update DNS at your domain registrar.

## Step 3: Update NEXTAUTH_URL

Since your domain is configured, update the environment variable:

1. **Go to Vercel → Settings → Environment Variables**
2. **Find:** `NEXTAUTH_URL`
3. **Update to:** `https://loanaticks.com` (or `https://www.loanaticks.com` if that's your primary)
4. **Make sure Production environment is selected**
5. **Save**
6. **Redeploy** (or it will auto-redeploy on next push)

## Step 4: Verify SSL Certificates

1. **Go to Vercel → Settings → Domains**
2. **Click on each domain:**
   - `loanaticks.com`
   - `www.loanaticks.com`
3. **Check SSL Status:**
   - Should show: ✅ "Valid Certificate"
   - If "Pending" → Wait 5-10 minutes

## Step 5: Test After Changes

1. **Wait 2-5 minutes** after updating NEXTAUTH_URL
2. **Visit:** `https://loanaticks.com`
3. **Try logging in**
4. **Check if authentication works**

## Common Issues

### Domain Shows "Invalid Configuration" in Vercel

**Fix:**
1. Go to Settings → Domains
2. Click on the domain
3. Check what DNS records Vercel expects
4. Add those records at your domain registrar
5. Wait for DNS propagation (5-60 minutes)

### Domain Loads But Shows "Not Secure" or No SSL

**Fix:**
1. Wait 5-10 minutes for SSL certificate to generate
2. Vercel auto-generates SSL certificates (Let's Encrypt)
3. If still not working after 10 minutes:
   - Go to Settings → Domains
   - Click "Refresh" or remove and re-add domain

### Domain Works But Login Doesn't Work

**Fix:**
1. Update `NEXTAUTH_URL` environment variable to your custom domain
2. Redeploy application
3. Clear browser cookies
4. Try logging in again

### www vs Non-www

**Best Practice:**
- Choose one as primary (usually `loanaticks.com`)
- Set the other to redirect
- Update `NEXTAUTH_URL` to match your primary domain

## Quick Test Commands

Open terminal and run:

```bash
# Check if domain resolves
ping loanaticks.com

# Check DNS records
nslookup loanaticks.com

# Check SSL certificate
curl -I https://loanaticks.com
```

## Next Steps

1. ✅ Domains are configured in Vercel
2. ⏳ Verify DNS is correct at registrar
3. ⏳ Update NEXTAUTH_URL to custom domain
4. ⏳ Test domain access
5. ⏳ Test login functionality

Your domains should work now! If not, check DNS at your domain registrar.
