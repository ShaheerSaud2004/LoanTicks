# Chatbot Implementation Plan

## Overview
Add a chatbot feature in the bottom right corner that can answer user questions about the loan application process, form fields, financial terms, and general mortgage/loan information.

## Options for AI/LLM Integration

### Option 1: OpenAI GPT (Recommended)
**Pros:**
- Easy to integrate with `openai` npm package
- Good understanding of financial/loan terminology
- Can be fine-tuned with context about the form
- Relatively affordable ($0.002 per 1K tokens for GPT-3.5-turbo)

**Cons:**
- Requires API key (costs money per request)
- Data sent to OpenAI (need to ensure no sensitive user data is sent)

**Setup:**
- Sign up at https://platform.openai.com
- Get API key
- Add `OPENAI_API_KEY` to environment variables
- Install: `npm install openai`

**Cost:** ~$0.002 per 1K tokens (very cheap for chat)

---

### Option 2: Anthropic Claude
**Pros:**
- Excellent at following instructions
- Good safety features
- Strong reasoning capabilities

**Cons:**
- More expensive than OpenAI
- Requires API key

**Setup:**
- Sign up at https://console.anthropic.com
- Get API key
- Add `ANTHROPIC_API_KEY` to environment variables
- Install: `npm install @anthropic-ai/sdk`

**Cost:** ~$0.008 per 1K tokens

---

### Option 3: Local LLM (Ollama/Llama)
**Pros:**
- Completely free
- No data leaves your server
- Full privacy

**Cons:**
- Requires running a local server
- May need more powerful hardware
- Less capable than cloud models
- Not suitable for Vercel/serverless

**Setup:**
- Install Ollama locally
- Run model server
- Make API calls to localhost

**Cost:** Free (but requires infrastructure)

---

### Option 4: Website Context Chatbot Services (RECOMMENDED FOR YOUR USE CASE!)
These services can crawl your website/docs and create a chatbot that understands your entire site context.

#### A. Chatbase (https://chatbase.co)
**Pros:**
- Can crawl your entire website automatically
- Can upload documentation/PDFs
- Provides API key for integration
- Understands your site's full context
- Built-in chat widget (or use API)
- Affordable pricing

**Setup:**
- Sign up at https://chatbase.co
- Add your website URL or upload docs
- Get API key
- Embed widget or use API

**Cost:** 
- Free tier: 20 messages/month
- Starter: $19/month (2,000 messages)
- Pro: $99/month (10,000 messages)

**Perfect for:** Your use case! Can ingest all your docs and form structure.

---

#### B. CustomGPT (https://customgpt.ai)
**Pros:**
- Can crawl entire website
- Upload sitemaps, docs, PDFs
- Provides API key
- Very customizable
- Good for knowledge bases

**Setup:**
- Sign up at https://customgpt.ai
- Add website URL or upload content
- Get API key
- Use their API or embed widget

**Cost:**
- Starter: $49/month (1,000 messages)
- Professional: $99/month (5,000 messages)

---

#### C. Tidio (https://www.tidio.com)
**Pros:**
- Can connect to your website
- AI chatbot with website context
- Easy setup
- Good UI

**Setup:**
- Sign up at https://www.tidio.com
- Connect your website
- Configure chatbot
- Get API key or use widget

**Cost:**
- Free tier available
- Paid: $29-59/month

---

#### D. Vercel AI SDK (if you're on Vercel)
**Pros:**
- Made by Vercel (your hosting platform!)
- Can use with OpenAI/Anthropic
- Can ingest website content
- Full control
- Free to use (just pay for AI API)

**Setup:**
- Use Vercel AI SDK
- Can crawl your docs folder
- Use OpenAI/Anthropic API
- Build custom UI

**Cost:** Just AI API costs (~$5/month)

---

#### E. Intercom (https://www.intercom.com)
**Pros:**
- Enterprise-grade
- Can ingest website content
- Full-featured
- Great analytics

**Cons:**
- Expensive
- May be overkill

**Cost:** $74-499/month

---

### Option 5: Pre-built Chatbot Service (Drift, etc.)
**Pros:**
- Full-featured chatbot UI
- Built-in analytics
- Easy setup

**Cons:**
- Monthly subscription fees ($50-200+/month)
- Less customizable
- May not understand loan-specific context well

**Cost:** $50-200+ per month

---

## Recommended Approach: OpenAI GPT-3.5-turbo

### Why OpenAI?
1. **Cost-effective**: Very cheap per request (~$0.002 per 1K tokens)
2. **Easy integration**: Simple API with good documentation
3. **Good performance**: Understands financial/loan terminology well
4. **Context-aware**: Can be given context about the form structure

### Implementation Plan

#### Phase 1: Setup & API Integration
1. **Get OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Create API key
   - Add to `.env.local`: `OPENAI_API_KEY=sk-...`
   - Add to Vercel environment variables

2. **Install Dependencies**
   ```bash
   npm install openai
   ```

3. **Create API Route**
   - `app/api/chatbot/route.ts`
   - Handles chat requests
   - Sends to OpenAI with context about the loan form
   - Returns responses

#### Phase 2: Context & Knowledge Base
1. **Create Context Document**
   - Document all form sections and fields
   - Explain what each field means
   - Include URLA 2019 form requirements
   - Financial terms glossary

2. **System Prompt**
   - Tell AI it's a loan application assistant
   - Provide form structure context
   - Set rules (don't give financial advice, just explain fields)
   - Emphasize security (don't ask for sensitive data)

#### Phase 3: UI Component
1. **Chatbot Button**
   - Fixed position bottom right
   - Floating button with chat icon
   - Badge for unread messages (optional)

2. **Chat Window**
   - Slide-up modal/drawer
   - Message history
   - Input field
   - Send button
   - Close button

3. **Styling**
   - Match website color scheme (gray/yellow)
   - Mobile-responsive
   - Smooth animations

#### Phase 4: Security & Privacy
1. **Data Sanitization**
   - Never send SSN, account numbers, or other sensitive data
   - Strip sensitive fields from context
   - Only send form field names and descriptions

2. **Rate Limiting**
   - Limit requests per user
   - Prevent abuse
   - Use existing rate limiter

3. **Error Handling**
   - Graceful fallbacks if API fails
   - User-friendly error messages
   - Logging (without sensitive data)

#### Phase 5: Features
1. **Basic Chat**
   - Send message
   - Receive AI response
   - Message history in session

2. **Context Awareness**
   - Know which step user is on
   - Reference specific form fields
   - Explain field requirements

3. **Smart Responses**
   - Answer questions about form fields
   - Explain financial terms
   - Guide users through the process
   - Provide examples when helpful

---

## Security Considerations

### What NOT to Send to AI:
- ❌ User's SSN
- ❌ Bank account numbers
- ❌ Personal financial data
- ❌ Specific dollar amounts from user's application
- ❌ User's name or personal identifiers

### What IS Safe to Send:
- ✅ Form field names (e.g., "purchasePrice", "loanAmount")
- ✅ Field descriptions and requirements
- ✅ General loan terminology
- ✅ User's question text
- ✅ Current step number (e.g., "Step 5 of 15")

---

## Cost Estimation

### OpenAI GPT-3.5-turbo:
- **Input tokens**: ~$0.0005 per 1K tokens
- **Output tokens**: ~$0.0015 per 1K tokens
- **Average conversation**: ~500 tokens per exchange
- **Cost per conversation**: ~$0.001 (less than 1 cent)

**Monthly estimate (1000 users, 5 questions each):**
- 5,000 conversations × $0.001 = **$5/month**

Very affordable!

---

## Implementation Steps

1. **Get OpenAI API Key** (5 minutes)
   - Sign up at https://platform.openai.com
   - Create API key
   - Add to environment variables

2. **Create API Route** (30 minutes)
   - `app/api/chatbot/route.ts`
   - OpenAI integration
   - Context injection
   - Error handling

3. **Create Chatbot Component** (1-2 hours)
   - Floating button
   - Chat window UI
   - Message handling
   - Styling

4. **Add Context Knowledge** (1 hour)
   - Form structure documentation
   - Field explanations
   - System prompt

5. **Testing & Refinement** (1 hour)
   - Test various questions
   - Refine responses
   - Optimize context

**Total Time:** ~4-5 hours

---

## Alternative: Simple FAQ-Based Chatbot

If you want to avoid API costs entirely, we could create a simple rule-based chatbot that:
- Matches keywords in questions
- Returns pre-written answers
- No AI needed
- Completely free
- Less flexible but still helpful

**Pros:** Free, fast, no API needed
**Cons:** Limited to pre-written answers, less natural

---

## Recommendation

### 🏆 BEST OPTION: Chatbase or CustomGPT

**Why these are perfect for you:**
1. **Can crawl your entire website** - Automatically understands all your docs, form structure, FAQs
2. **No manual context building** - Just point it at your website/docs folder
3. **Provides API key** - Easy integration with your Next.js app
4. **Affordable** - $19-99/month depending on usage
5. **Built-in knowledge** - Understands your entire site without you having to write prompts

**How it works:**
1. Sign up for Chatbase or CustomGPT
2. Give it your website URL or upload your `/docs` folder
3. It crawls and indexes everything automatically
4. Get an API key
5. Use their API in your Next.js app
6. Chatbot knows everything about your site!

**My recommendation: Start with Chatbase**
- Easiest setup
- Good pricing ($19/month starter)
- Can crawl your entire site
- Provides API for custom integration
- Can also use their widget if you want

### Alternative: Vercel AI SDK + OpenAI
If you want more control and lower cost:
- Use Vercel AI SDK (free)
- Point it at your `/docs` folder
- Use OpenAI API (~$5/month)
- Full control over everything

---

## Next Steps

1. **Decide on approach:**
   - **Chatbase (RECOMMENDED)** - $19/month, crawls your site automatically
   - **CustomGPT** - $49/month, similar to Chatbase
   - **Vercel AI SDK + OpenAI** - ~$5/month, more control but more setup
   - **OpenAI direct** - $5-10/month, manual context building
   - **Simple FAQ bot** - Free but limited

2. **If using Chatbase/CustomGPT:**
   - Sign up and create a chatbot
   - Add your website URL or upload `/docs` folder
   - Get API key
   - I'll integrate it into your app

3. **Let me know your choice** and I'll implement it!

---

## Quick Comparison

| Service | Cost | Setup Time | Website Crawl | API Available |
|---------|------|------------|---------------|---------------|
| **Chatbase** | $19-99/mo | 10 min | ✅ Yes | ✅ Yes |
| **CustomGPT** | $49-99/mo | 15 min | ✅ Yes | ✅ Yes |
| **Tidio** | $29-59/mo | 20 min | ✅ Yes | ✅ Yes |
| **Vercel AI SDK** | ~$5/mo | 2-3 hours | ✅ Manual | ✅ Yes |
| **OpenAI Direct** | ~$5/mo | 4-5 hours | ❌ Manual | ✅ Yes |
| **FAQ Bot** | Free | 1 hour | ❌ No | ✅ Yes |

**For your use case, Chatbase is the best balance of ease, cost, and features!**

---

## Questions to Consider

1. Do you want to track chat conversations for analytics?
2. Should the chatbot remember context within a session?
3. Do you want to add a "Was this helpful?" feedback button?
4. Should it be available on all pages or just the loan application?
5. Do you want to limit how many questions per user per day?
