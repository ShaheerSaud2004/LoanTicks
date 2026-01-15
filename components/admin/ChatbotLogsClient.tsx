'use client';

import { useState } from 'react';
import { MessageCircle, Search, Filter, Calendar, User, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
}

interface Conversation {
  _id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId: string;
  messages: Message[];
  currentStep?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ChatbotLogsClientProps {
  conversations: Conversation[];
  stats: {
    totalConversations: number;
    totalMessages: number;
    todayMessages: number;
    uniqueUsers: number;
  };
}

export default function ChatbotLogsClient({ conversations, stats }: ChatbotLogsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      !searchTerm ||
      conv.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some((msg) => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || conv.userRole === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Conversation Logs</h1>
          <p className="text-gray-600 mt-2">View and analyze user interactions with the chatbot</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Conversations</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Messages</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Messages</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.todayMessages}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <User className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Unique Users</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Conversation List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversations ({filteredConversations.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                    selectedConversation?._id === conv._id ? 'bg-yellow-50 border-yellow-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {conv.userEmail ? (
                        <Mail className="w-4 h-4 text-gray-400" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900">
                        {conv.userEmail || 'Anonymous'}
                      </span>
                      {conv.userRole && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                          {conv.userRole}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(conv.updatedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {conv.messages[0]?.content || 'No messages'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Conversation Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conversation Details</h2>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {selectedConversation ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {selectedConversation.userEmail || 'Not provided'}</p>
                    <p><span className="font-medium">Role:</span> {selectedConversation.userRole || 'Not provided'}</p>
                    <p><span className="font-medium">Session ID:</span> {selectedConversation.sessionId}</p>
                    <p><span className="font-medium">Started:</span> {formatDate(selectedConversation.createdAt)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(selectedConversation.updatedAt)}</p>
                    {selectedConversation.currentStep && (
                      <p><span className="font-medium">Form Step:</span> {selectedConversation.currentStep} of 15</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                  {selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-yellow-100 border-l-4 border-yellow-500'
                          : 'bg-gray-100 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase">
                          {msg.role === 'user' ? 'User' : 'Assistant'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
