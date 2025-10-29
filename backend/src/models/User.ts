import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  authUid: string;
  email: string;
  name: string;
  avatarImage?: string; // Stores the avatar name (e.g., 'pipo_set', 'bro_set', 'cherry_set')
  profile: {
    severityLevel: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
    focusHints: string[];
  };
  streak: {
    current: number;
    longest: number;
    lastActiveAt: Date;
  };
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    authUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatarImage: {
      type: String,
      default: 'pipo_set',
      trim: true
    },
    profile: {
      severityLevel: {
        type: String,
        enum: ['Minimal', 'Mild', 'Moderate', 'Severe'],
        default: 'Moderate'
      },
      focusHints: {
        type: [String],
        default: []
      }
    },
    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      longest: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActiveAt: {
        type: Date,
        default: null
      }
    },
    achievements: {
      type: [String],
      default: [],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ authUid: 1 });

export default mongoose.model<IUser>('User', UserSchema);
