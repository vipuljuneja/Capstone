import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEncouragementNote extends Document {
  userId: Types.ObjectId;
  date: string;
  title: string;
  body: string;
  tags: string[];
  linkedSessionId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const EncouragementNoteSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    linkedSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'PracticeSession',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for journal queries
EncouragementNoteSchema.index({ userId: 1, date: -1 });
EncouragementNoteSchema.index({ userId: 1, tags: 1 });

export default mongoose.model<IEncouragementNote>('EncouragementNote', EncouragementNoteSchema);