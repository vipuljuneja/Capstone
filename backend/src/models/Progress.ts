import mongoose, { Schema, Document, Types } from 'mongoose';

interface ILevelProgress {
  attempts: number;
  lastCompletedAt: Date | null;
  achievements: string[];
  unlockedAt: Date | null;
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  scenarioId: Types.ObjectId;
  levels: Map<string, ILevelProgress>;
  totalSessions: number;
  lastPlayedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LevelProgressSchema = new Schema(
  {
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCompletedAt: {
      type: Date,
      default: null
    },
    achievements: {
      type: [String],
      default: []
    },
    unlockedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const ProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    scenarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario',
      required: true,
      index: true
    },
    levels: {
      type: Map,
      of: LevelProgressSchema,
      default: {}
    },
    totalSessions: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPlayedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index - one progress doc per user-scenario pair
ProgressSchema.index({ userId: 1, scenarioId: 1 }, { unique: true });

// Index for home screen queries
ProgressSchema.index({ userId: 1, lastPlayedAt: -1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
