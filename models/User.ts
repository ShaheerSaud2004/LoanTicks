import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'employee' | 'customer';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
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
      required: [true, 'Password is required'],
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
  },
  {
    timestamps: true,
  }
);

// Validate password complexity before saving
UserSchema.pre('save', async function (next) {
  // Only validate on new documents or when password is modified
  if (this.isModified('password')) {
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

