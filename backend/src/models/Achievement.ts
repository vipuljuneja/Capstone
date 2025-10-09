import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'session' | 'progress' | 'streak' | 'skill';
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['session', 'progress', 'streak', 'skill'],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
