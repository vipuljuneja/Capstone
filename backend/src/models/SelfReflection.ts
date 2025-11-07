import mongoose, { Document, Schema } from 'mongoose';

export interface ISelfReflection extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  type: 'pipo' | 'self';
  readAt: Date | null;
  imageName?: string; // For Pipo avatar image
  motivation?: string; // For Pipo motivation message
  linkedSessionId?: mongoose.Types.ObjectId; // Link to PracticeSession
  scenarioId?: mongoose.Types.ObjectId; // Quick reference to scenario
  level?: number; // 1, 2, or 3
  createdAt: Date;
  updatedAt: Date;
}

const SelfReflectionSchema = new Schema<ISelfReflection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pipo', 'self'],
      required: true,
      default: 'self',
    },
    readAt: {
      type: Date,
      default: null,
      // Null until the user views the note
    },
    imageName: {
      type: String,
      trim: true,
      // Optional: Used for Pipo messages to store avatar image name
    },
    motivation: {
      type: String,
      trim: true,
      // Optional: Used for Pipo messages to store motivation title
    },
    linkedSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'PracticeSession',
      default: null,
      // Optional: Links Pipo notes to the practice session they came from
    },
    scenarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario',
      default: null,
      // Optional: Quick reference to scenario for filtering
    },
    level: {
      type: Number,
      min: 1,
      max: 3,
      default: null,
      // Optional: Level of the practice session (1, 2, or 3)
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by user and date
SelfReflectionSchema.index({ userId: 1, date: -1 });
SelfReflectionSchema.index({ userId: 1, type: 1, date: -1 });
SelfReflectionSchema.index({ linkedSessionId: 1 });
SelfReflectionSchema.index({ userId: 1, scenarioId: 1, level: 1 });
SelfReflectionSchema.index({ userId: 1, type: 1, readAt: 1 });

const SelfReflection = mongoose.model<ISelfReflection>(
  'SelfReflection',
  SelfReflectionSchema
);

export default SelfReflection;
