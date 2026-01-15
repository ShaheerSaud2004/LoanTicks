import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import connectDB from '@/lib/mongodb';
import ChatbotConversation from '@/models/ChatbotConversation';
import ChatbotLogsClient from '@/components/admin/ChatbotLogsClient';

export default async function ChatbotLogsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch chatbot conversations
  let conversations = [];
  let stats = {
    totalConversations: 0,
    totalMessages: 0,
    todayMessages: 0,
    uniqueUsers: 0,
  };

  try {
    await connectDB();

    // Get all conversations, sorted by most recent
    conversations = await ChatbotConversation.find({})
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    // Calculate stats
    stats.totalConversations = await ChatbotConversation.countDocuments();
    
    const allConversations = await ChatbotConversation.find({}).lean();
    stats.totalMessages = allConversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayConversations = await ChatbotConversation.find({
      createdAt: { $gte: today },
    }).lean();
    stats.todayMessages = todayConversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
    
    const uniqueUserIds = new Set(
      allConversations
        .map((conv) => conv.userId)
        .filter((id) => id)
    );
    stats.uniqueUsers = uniqueUserIds.size;

    // Serialize for client component
    conversations = JSON.parse(JSON.stringify(conversations));
  } catch (error) {
    console.error('Error fetching chatbot logs:', error);
  }

  return (
    <DashboardLayout
      userName={session.user.name || 'Admin'}
      userRole={session.user.role}
      userEmail={session.user.email || ''}
    >
      <ChatbotLogsClient conversations={conversations} stats={stats} />
    </DashboardLayout>
  );
}
