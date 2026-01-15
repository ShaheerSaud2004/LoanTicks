# 🌐 Custom Domain Setup Guide

## Your Issue

- ✅ Vercel URL works: `loantickssss-git-main-shaheers-projects-02efc33d.vercel.app`
- ❌ Custom domain doesn't work: `loanaticks.com`
- ✅ Deployment is successful (Ready status)

This means your app is working, but the custom domain needs DNS configuration.

## Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Sign in
   - Select your project: **LoanTicks**

2. **Go to Settings → Domains:**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

3. **Add Your Domain:**
   - Enter: `loanaticks.com`
   - Click **Add**
   - Vercel will show you DNS configuration instructions

## Step 2: Configure DNS Records

Vercel will show you what DNS records to add. You need to add these to your domain registrar (where you bought `loanaticks.com`).

### Option A: Root Domain (loanaticks.com)

Add these DNS records at your domain registrar:

#### Record 1: A Record
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

#### Record 2: A Record (Alternative)
```
Type: A
Name: @ (or leave blank)
Value: 76.223.126.42
TTL: 3600 (or Auto)
```

#### Record 3: CNAME Record (for www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Option B: CNAME (Easier - Recommended)

If your registrar supports CNAME for root domain (some do, like Cloudflare):

```
Type: CNAME
Name: @ (or leave blank)
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Option C: Use Vercel's Nameservers (Best Option)

1. **Get Vercel Nameservers:**
   - In Vercel → Settings → Domains
   - Click on your domain
   - Look for "Nameservers" section
   - Copy the nameservers (usually 4 of them)

2. **Update at Your Domain Registrar:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Find "DNS Settings" or "Nameservers"
   - Change from default to "Custom Nameservers"
   - Paste Vercel's nameservers
   - Save

**This is the easiest option** - Vercel manages all DNS automatically!

## Step 3: Where to Add DNS Records

### Common Domain Registrars:

#### GoDaddy:
1. Go to: https://dcc.godaddy.com
2. Click on `loanaticks.com`
3. Click **DNS** tab
4. Add the records shown above

#### Namecheap:
1. Go to: https://www.namecheap.com
2. Domain List → Manage `loanaticks.com`
3. Click **Advanced DNS** tab
4. Add the records

#### Cloudflare:
1. Go to: https://dash.cloudflare.com
2. Select your domain
3. Go to **DNS** → **Records**
4. Add the records

#### Google Domains:
1. Go to: https://domains.google.com
2. Click on your domain
3. Go to **DNS** tab
4. Add the records

## Step 4: Wait for DNS Propagation

After adding DNS records:

1. **Wait 5-60 minutes** for DNS to propagate
   - Can take up to 24 hours, but usually 5-60 minutes

2. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `loanaticks.com`
   - Check if it shows Vercel's IP addresses

3. **Check in Vercel:**
   - Go to Settings → Domains
   - Look for your domain
   - Status should change from "Pending" to "Valid Configuration"
   - SSL certificate will auto-generate (takes 5-10 minutes)

## Step 5: Update NEXTAUTH_URL

Once your domain is working:

1. **Go to Vercel → Settings → Environment Variables**
2. **Update NEXTAUTH_URL:**
   - Change from: `https://loantickssss.vercel.app`
   - Change to: `https://loanaticks.com`
   - Make sure **Production** environment is selected
3. **Save**
4. **Redeploy** your application

## Step 6: Verify Everything Works

1. **Check Domain Status:**
   - Vercel → Settings → Domains
   - Should show: ✅ "Valid Configuration"
   - Should show: ✅ SSL Certificate (auto-generated)

2. **Test Your Domain:**
   - Visit: `https://loanaticks.com`
   - Should load your app
   - Should show padlock (HTTPS)

3. **Test www Subdomain:**
   - Visit: `https://www.loanaticks.com`
   - Should redirect to `loanaticks.com` or load the same

## Troubleshooting

### Domain Still Not Working After 1 Hour

1. **Check DNS Records:**
   - Use: https://dnschecker.org
   - Verify records are correct
   - Check if they've propagated globally

2. **Check Vercel Domain Status:**
   - Settings → Domains
   - Look for error messages
   - Check if SSL certificate is generating

3. **Common Issues:**

   **Issue:** "Invalid Configuration"
   - ✅ DNS records not added correctly
   - ✅ Wrong IP addresses
   - ✅ TTL too high (should be 3600 or Auto)

   **Issue:** "SSL Certificate Pending"
   - ✅ Wait 5-10 minutes
   - ✅ Make sure DNS is correct
   - ✅ Vercel auto-generates SSL (Let's Encrypt)

   **Issue:** "Domain Not Found"
   - ✅ DNS not propagated yet
   - ✅ Check DNS records at registrar
   - ✅ Wait longer (up to 24 hours)

### Quick DNS Check Commands

Open terminal and run:

```bash
# Check A record
dig loanaticks.com +short

# Check CNAME
dig www.loanaticks.com +short

# Check nameservers
dig NS loanaticks.com +short
```

Should show Vercel's IP addresses or CNAME.

## Current Status

Based on your deployment:
- ✅ **Deployment:** Ready (working)
- ✅ **Vercel URL:** Working
- ❌ **Custom Domain:** Needs DNS configuration
- ✅ **SSL:** Will auto-generate once DNS is correct

## Next Steps

1. **Add domain in Vercel** (Settings → Domains)
2. **Add DNS records** at your domain registrar
3. **Wait 5-60 minutes** for propagation
4. **Update NEXTAUTH_URL** to `https://loanaticks.com`
5. **Redeploy** application
6. **Test** `https://loanaticks.com`

Your app is working perfectly - just need to connect the domain! 🎉
