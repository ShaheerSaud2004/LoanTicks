import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWaitlist extends Document {
  _id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
  },
  {
    timestamps: true,
  }
);

const Waitlist: Model<IWaitlist> = mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);

export default Waitlist;


