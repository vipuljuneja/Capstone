import mongoose, { Schema, Document, Types } from 'mongoose';

interface IFiller {
  word: string;
  t: number;
}

interface IPause {
  t: number;
  len: number;
}

interface ITone {
  score: number;
  labels: string[];
}

interface IEyeContact {
  available: boolean;
  ratio: number | null;
}

interface ISmile {
  ratio: number | null;
}

interface IMetrics {
  durationSec: number;
  wpm: number;
  fillers: IFiller[];
  pauses: IPause[];
  tone: ITone;
  eyeContact: IEyeContact;
  smile: ISmile;
}

interface IStep {
  order: number;
  startedAt: Date;
  endedAt: Date;
  transcript: string;
  metrics: IMetrics;
}

interface IAggregate {
  wpmAvg: number;
  fillersPerMin: number;
  toneScore: number;
  eyeContactRatio: number | null;
  score: number;
}

interface IFeedbackCard {
  title: string;
  body: string;
  type: 'tip' | 'praise' | 'warning';
}

export interface IPracticeSession extends Document {
  userId: Types.ObjectId;
  scenarioId: Types.ObjectId;
  level: number;
  status: 'active' | 'abandoned' | 'completed';
  steps: IStep[];
  aggregate: IAggregate;
  aiFeedbackCards: IFeedbackCard[];
  achievementsUnlocked: string[];
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeSessionSchema: Schema = new Schema(
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
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    status: {
      type: String,
      enum: ['active', 'abandoned', 'completed'],
      default: 'active',
      index: true
    },
    steps: [
      {
        order: {
          type: Number,
          required: true
        },
        startedAt: {
          type: Date,
          required: true
        },
        endedAt: {
          type: Date,
          required: true
        },
        transcript: {
          type: String,
          required: true
        },
        metrics: {
          durationSec: Number,
          wpm: Number,
          fillers: [
            {
              word: String,
              t: Number
            }
          ],
          pauses: [
            {
              t: Number,
              len: Number
            }
          ],
          tone: {
            score: Number,
            labels: [String]
          },
          eyeContact: {
            available: Boolean,
            ratio: {
              type: Number,
              default: null
            }
          },
          smile: {
            ratio: {
              type: Number,
              default: null
            }
          }
        }
      }
    ],
    aggregate: {
      wpmAvg: {
        type: Number,
        default: 0
      },
      fillersPerMin: {
        type: Number,
        default: 0
      },
      toneScore: {
        type: Number,
        default: 0
      },
      eyeContactRatio: {
        type: Number,
        default: null
      },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    aiFeedbackCards: [
      {
        title: {
          type: String,
          required: true
        },
        body: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['tip', 'praise', 'warning'],
          required: true
        }
      }
    ],
    achievementsUnlocked: {
      type: [String],
      default: []
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for querying user sessions and analytics
PracticeSessionSchema.index({ userId: 1, completedAt: -1 });
PracticeSessionSchema.index({ scenarioId: 1, level: 1 });
PracticeSessionSchema.index({ userId: 1, scenarioId: 1, level: 1 });

export default mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);