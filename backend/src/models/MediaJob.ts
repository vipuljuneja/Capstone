import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISource {
  image: {
    bucket: string;
    key: string;
  };
  voiceId: string;
  promptText: string;
}

interface IOutput {
  bucket: string;
  key: string;
}

export interface IMediaJob extends Document {
  scenarioId: Types.ObjectId;
  level: number;
  questionOrder: number;
  provider: string;
  jobId: string;
  status: 'queued' | 'rendering' | 'uploaded' | 'published' | 'failed';
  requestedAt: Date;
  error: string | null;
  source: ISource;
  output: IOutput | null;
  createdAt: Date;
  updatedAt: Date;
}

const MediaJobSchema: Schema = new Schema(
  {
    scenarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario',
      required: true,
      index: true
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    questionOrder: {
      type: Number,
      required: true
    },
    provider: {
      type: String,
      required: true,
      default: 'did'
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['queued', 'rendering', 'uploaded', 'published', 'failed'],
      default: 'queued',
      index: true
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    error: {
      type: String,
      default: null
    },
    source: {
      image: {
        bucket: {
          type: String,
          required: true
        },
        key: {
          type: String,
          required: true
        }
      },
      voiceId: {
        type: String,
        required: true
      },
      promptText: {
        type: String,
        required: true
      }
    },
    output: {
      type: {
        bucket: String,
        key: String
      },
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for job tracking and querying
MediaJobSchema.index({ status: 1, requestedAt: 1 });
MediaJobSchema.index({ scenarioId: 1, level: 1, questionOrder: 1 });

export default mongoose.model<IMediaJob>('MediaJob', MediaJobSchema);