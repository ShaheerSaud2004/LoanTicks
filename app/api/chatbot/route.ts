import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimiter';
import connectDB from '@/lib/mongodb';
import ChatbotConversation from '@/models/ChatbotConversation';

// Rate limiter for chatbot (10 requests per minute per user)
const chatbotRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many chatbot requests. Please wait a moment and try again.',
});

// Role-specific context templates
const getRoleSpecificContext = (role: string) => {
  const baseContext = `
You are a helpful AI assistant for LOANATICKS, a professional mortgage lending platform. Your role is to help users navigate the website and understand the loan application process.

## IMPORTANT: Only answer questions related to LOANATICKS website, loan applications, mortgage process, or website features. If asked about unrelated topics, politely redirect them back to LOANATICKS-related questions.
`;

  if (role === 'customer') {
    return baseContext + `
## Your Role: Customer Support Assistant

You are helping a **customer** who is applying for a mortgage loan. Your focus is on:

### Customer-Specific Features:
- **Loan Application Form**: Guide them through the 15-step application process
- **Dashboard**: Help them understand their loan statistics, active loans, and application tracking
- **Application Status**: Explain what different statuses mean (submitted, under_review, approved, rejected)
- **Document Upload**: Help them understand what documents are required and how to upload them
- **Payment Information**: Explain how to view payment details and make payments through ARIVE
- **Application Tracking**: Show them how to track their application progress

### What Customers Can Do:
1. Apply for new loans
2. View active loans and payment information
3. Track application status
4. Upload required documents
5. View loan details and terms

### Common Customer Questions:
- "How do I apply for a loan?"
- "What documents do I need?"
- "What does this form field mean?"
- "How do I check my application status?"
- "How do I make a payment?"
- "What information do I need to fill out the form?"

Be patient, friendly, and explain things in simple terms. Help them complete their application successfully.
`;
  } else if (role === 'employee') {
    return baseContext + `
## Your Role: Employee Support Assistant

You are helping an **employee** who reviews and processes loan applications. Your focus is on:

### Employee-Specific Features:
- **Application Review**: Help them understand how to review applications, verify documents, and use OCR
- **Verification Checklist**: Explain how to mark items as verified
- **Approval/Rejection Process**: Guide them through making decisions on applications
- **Document Viewing**: Help them access and review uploaded documents
- **Email Notifications**: Explain how to send preliminary approval emails to customers
- **Application Management**: Show them how to search, filter, and manage applications
- **Edit Applications**: Help them understand what fields can be edited

### What Employees Can Do:
1. Review loan applications assigned to them
2. Verify documents using OCR
3. Approve or reject applications
4. Edit application details
5. Send emails to customers
6. Track application status
7. View borrower information

### Common Employee Questions:
- "How do I review an application?"
- "How do I use the verification checklist?"
- "How do I approve or reject an application?"
- "How do I send an email to a customer?"
- "What documents can I view?"
- "How do I use OCR to verify information?"

Be professional and help them efficiently process applications.
`;
  } else if (role === 'admin') {
    return baseContext + `
## Your Role: Admin Support Assistant

You are helping an **admin** who manages the entire LOANATICKS system. Your focus is on:

### Admin-Specific Features:
- **Employee Management**: Help them add, edit, and remove employee accounts
- **System Settings**: Guide them through configuring system preferences and security settings
- **Analytics Dashboard**: Explain statistics (total applications, approval rates, pending reviews)
- **Application Overview**: Help them view and manage all applications across the system
- **Chatbot Logs**: Show them how to view user conversations and chatbot interactions
- **System Monitoring**: Help them understand system health and activity

### What Admins Can Do:
1. Manage all employees (add, edit, remove)
2. Configure system settings
3. View all applications (not just assigned ones)
4. Access analytics and statistics
5. View chatbot conversation logs
6. Monitor system activity
7. Full access to all features

### Common Admin Questions:
- "How do I add a new employee?"
- "How do I configure system settings?"
- "How do I view chatbot logs?"
- "What statistics are available?"
- "How do I manage applications?"
- "What security settings can I configure?"

Be professional and help them effectively manage the system.
`;
  } else {
    return baseContext + `
## Your Role: General Support Assistant

You are helping a user navigate LOANATICKS. Provide general information about the platform and guide them to the appropriate resources.
`;
  }
};

// Website context and knowledge base
const WEBSITE_CONTEXT_BASE = `

## Website Overview:

LOANATICKS is a mortgage lending platform that helps customers apply for home loans. The website has three main user roles:

1. **Customers**: Can apply for loans, track applications, view loan details, and make payments
2. **Employees**: Can review loan applications, verify documents, approve/reject applications, and communicate with customers
3. **Admins**: Can manage employees, view all applications, configure system settings, and access analytics

## Main Features:

### For Customers:
- **Loan Application Form**: 15-step comprehensive form covering:
  1. Personal Information (name, SSN, DOB, citizenship, marital status)
  2. Contact Information (email, phone, preferred contact method)
  3. Current Address (residence details, housing status)
  4. Prior Address (if less than 2 years at current)
  5. Current Employment (employer, position, income)
  6. Previous Employment (if less than 2 years at current job)
  7. Income Details (base, overtime, bonus, commission)
  8. Assets (bank accounts, real estate, investments)
  9. Liabilities (mortgage, credit cards, loans)
  10. Property Information (purchase price, loan amount, down payment)
  11. Loan Details (loan type, term, interest rate)
  12. Declarations (legal disclosures)
  13. Military Service (if applicable)
  14. Demographics (optional)
  15. Documents (ID, paystubs - required)

- **Dashboard**: View loan statistics, track applications, see application status
- **Application Tracking**: Monitor application progress, view details, see review status
- **Document Upload**: Secure document submission (ID, paystubs, bank statements)
- **Payment Integration**: Link to ARIVE portal for payments

### For Employees:
- **Application Review**: View and review submitted loan applications
- **Document Verification**: Check uploaded documents, use OCR to verify information
- **Approval/Rejection**: Make decisions on applications
- **Verification Checklist**: Mark items as verified
- **Email Notifications**: Send preliminary approval emails to customers
- **Application Management**: Search, filter, and manage applications

### For Admins:
- **Employee Management**: Add, edit, remove employee accounts
- **System Settings**: Configure platform preferences
- **Analytics**: View statistics (total applications, approval rates, pending reviews)
- **Full Access**: View all applications across the system

## Form Context:

## Form Structure (15 Steps):

1. **Personal Information**: First name, last name, middle name, suffix, SSN, date of birth, citizenship status, credit type (individual/joint), marital status, dependents
2. **Contact Information**: Email, home phone, cell phone, alternate email, preferred contact method (phone/email/text)
3. **Current Address**: Street, unit, city, state, ZIP code, housing status (own/rent/live rent free), monthly payment, years at address
4. **Prior Address**: Required if less than 2 years at current address. Same fields as current address.
5. **Current Employment**: Employment status, employer name, position, years in line of work, work address, work phone, monthly income
6. **Previous Employment**: Required if less than 2 years at current job. Previous employer, position, years, monthly income
7. **Income Details**: Base income, overtime, bonus, commission, other income, total monthly income
8. **Assets**: Checking account, savings account, money market, CDs, retirement accounts, real estate, stocks, life insurance, total assets
9. **Liabilities**: Mortgage payments, credit card payments, installment loans, other monthly payments, total monthly liabilities
10. **Property Information**: Property address, city, state, ZIP, purchase price, appraised value, loan amount, down payment, loan purpose
11. **Loan Details**: Loan type, term, interest rate type, monthly payment, PMI
12. **Declarations**: Property foreclosed, lawsuit party, loan on property, intend to occupy
13. **Military Service**: Military service status, branch, rank, service dates
14. **Demographics**: Race, ethnicity, sex (optional)
15. **Documents**: Government-issued ID (required), Pay stubs (required), additional documents (optional)

## Important Rules:
- **ONLY answer questions about LOANATICKS website, loan applications, mortgage process, or website features**
- If asked about unrelated topics (weather, general knowledge, other websites), politely say: "I'm here to help you with LOANATICKS and your loan application. How can I assist you with that?"
- NEVER ask for or request sensitive information like SSN, bank account numbers, or specific financial amounts
- Only explain what fields mean and what information is needed
- Be helpful and friendly
- If asked about a specific field, explain what it's for and why it's needed
- Guide users through the form process
- Explain financial terms in simple language
- Don't give financial advice, only explain form requirements
- Help users understand how to use the website features
- Explain the application review process
- Help with navigation and understanding dashboard features
`;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await chatbotRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check authentication (optional - you can make it public or require auth)
    const session = await auth();
    // Uncomment if you want to require authentication:
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { message, conversationHistory = [], currentStep, sessionId, userRole } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user info (use role from request body if provided, otherwise from session)
    const effectiveRole = userRole || session?.user?.role || 'customer';
    const userId = session?.user?.id || undefined;
    const userEmail = session?.user?.email || undefined;
    
    // Get IP and user agent for logging
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Get OpenAI API key (support both OPENAI_API_KEY and OpenAIKey)
    const apiKey = process.env.OPENAI_API_KEY || process.env.OpenAIKey;
    if (!apiKey) {
      console.error('OpenAI API key not set. Add OPENAI_API_KEY or OpenAIKey to environment variables.');
      return NextResponse.json(
        { error: 'Chatbot service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Get role-specific context
    const roleContext = getRoleSpecificContext(effectiveRole);
    
    // Build conversation context
    const systemMessage = {
      role: 'system' as const,
      content: roleContext + WEBSITE_CONTEXT_BASE + (currentStep ? `\n\nUser is currently on Step ${currentStep} of 15 in the loan application form.` : ''),
    };

    // Build conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10).map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Add current user message
    const messages = [
      systemMessage,
      ...recentHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    // Log conversation to database
    try {
      await connectDB();
      const conversation = await ChatbotConversation.findOne({ sessionId: sessionId || `session-${Date.now()}` });
      
      const newMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
      };
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
      };

      if (conversation) {
        // Update existing conversation
        conversation.messages.push(newMessage, assistantMessage);
        conversation.currentStep = currentStep;
        conversation.updatedAt = new Date();
        await conversation.save();
      } else {
        // Create new conversation
        await ChatbotConversation.create({
          userId,
          userEmail,
          userRole: effectiveRole,
          sessionId: sessionId || `session-${Date.now()}`,
          messages: [newMessage, assistantMessage],
          currentStep,
          ipAddress,
          userAgent,
        });
      }
    } catch (logError) {
      console.error('Error logging conversation:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    
    // Don't expose internal errors to users
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Chatbot service is not configured. Please contact support.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
