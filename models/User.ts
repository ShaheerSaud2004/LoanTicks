import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'employee' | 'customer';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: UserRole;
  phone?: string;
  isApproved: boolean; // Admin approval status
  approvedBy?: string; // Admin user ID who approved
  approvedAt?: Date; // When approved
  provider?: 'credentials' | 'google'; // Auth provider
  providerId?: string; // OAuth provider user ID
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: function(this: IUser) {
        // Password required only for credentials provider
        return !this.provider || this.provider === 'credentials';
      },
      minlength: [12, 'Password must be at least 12 characters'],
      // Password complexity validation is done in pre-save hook
    },
    role: {
      type: String,
      enum: ['admin', 'employee', 'customer'],
      default: 'customer',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Requires admin approval
    },
    approvedBy: {
      type: String,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    providerId: {
      type: String, // Google user ID for OAuth users
    },
  },
  {
    timestamps: true,
  }
);

// Validate password complexity before saving
UserSchema.pre('save', async function (next) {
  // Only validate password for credentials provider or if password is being set
  if (this.isModified('password') && this.password && (!this.provider || this.provider === 'credentials')) {
    const password = this.password;
    
    // Password complexity requirements
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    if (password.length < minLength) {
      return next(new Error(`Password must be at least ${minLength} characters long`));
    }
    
    if (!hasUpperCase) {
      return next(new Error('Password must contain at least one uppercase letter'));
    }
    
    if (!hasLowerCase) {
      return next(new Error('Password must contain at least one lowercase letter'));
    }
    
    if (!hasNumber) {
      return next(new Error('Password must contain at least one number'));
    }
    
    if (!hasSpecialChar) {
      return next(new Error('Password must contain at least one special character (@$!%*?&)'));
    }
  }
  
  // Hash password before saving
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Delete password from JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

