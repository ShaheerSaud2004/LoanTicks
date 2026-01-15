import mongoose, { Schema, Document } from 'mongoose';

export interface IChatbotConversation extends Document {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentStep?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotConversationSchema = new Schema<IChatbotConversation>(
  {
    userId: {
      type: String,
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentStep: {
      type: Number,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ChatbotConversationSchema.index({ createdAt: -1 });
ChatbotConversationSchema.index({ userId: 1, createdAt: -1 });
ChatbotConversationSchema.index({ userRole: 1, createdAt: -1 });

const ChatbotConversationModel = mongoose.models.ChatbotConversation as mongoose.Model<IChatbotConversation> ||
  mongoose.model<IChatbotConversation>('ChatbotConversation', ChatbotConversationSchema);

export default ChatbotConversationModel;
