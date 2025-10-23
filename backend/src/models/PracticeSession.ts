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

interface IFacialAnalysisScores {
  eyeContact: number;
  posture: number;
  expressiveness: number;
  composure: number;
  naturalness: number;
}

interface IEyeRollDetail {
  frameIndex: number;
  timestamp: number;
  intensity: number;
  lookUpValue: number;
}

interface IFacialDetailedMetrics {
  eyeRolls: {
    count: number;
    details: IEyeRollDetail[];
  };
  blinking: {
    total: number;
    perMinute: number;
    isExcessive: boolean;
  };
  gaze: {
    stabilityScore: number;
    isStable: boolean;
  };
  smiles: {
    percentage: number;
    genuine: number;
    forced: number;
    authenticityRatio: number;
  };
  tension: {
    average: number;
    max: number;
    isHigh: boolean;
  };
  microExpressions: {
    count: number;
    types: Record<string, number>;
  };
}

interface IFacialStrength {
  metric: string;
  score: number;
  icon: string;
  message: string;
  impact: string;
}

interface IFacialWeakness {
  metric: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
  icon: string;
  issue: string;
  why: string;
}

interface IFacialRecommendation {
  priority: 'low' | 'medium' | 'high';
  area: string;
  issue: string;
  recommendation: string;
  exercise: string;
  impact: string;
}

interface IFacialAnalysis {
  summary: {
    overallScore: number;
    level: string;
    totalFrames: number;
    duration: number;
    timestamp: Date;
  };
  scores: IFacialAnalysisScores;
  detailedMetrics: IFacialDetailedMetrics;
  strengths: IFacialStrength[];
  weaknesses: IFacialWeakness[];
  recommendations: IFacialRecommendation[];
  keyInsights: string[];
}

export interface IPracticeSession extends Document {
  userId: Types.ObjectId;
  scenarioId: Types.ObjectId;
  level: number;
  status: 'active' | 'abandoned' | 'completed';
  steps: IStep[];
  aggregate: IAggregate;
  facialAnalysis: IFacialAnalysis | null; // Complete facial analysis data
  aiFeedbackCards: IFeedbackCard[];
  achievementsUnlocked: string[];
  pipoNoteId: Types.ObjectId | null; // Link to SelfReflection (Pipo note)
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
    facialAnalysis: {
      type: {
        summary: {
          overallScore: Number,
          level: String,
          totalFrames: Number,
          duration: Number,
          timestamp: Date
        },
        scores: {
          eyeContact: Number,
          posture: Number,
          expressiveness: Number,
          composure: Number,
          naturalness: Number
        },
        detailedMetrics: {
          eyeRolls: {
            count: Number,
            details: [
              {
                frameIndex: Number,
                timestamp: Number,
                intensity: Number,
                lookUpValue: Number
              }
            ]
          },
          blinking: {
            total: Number,
            perMinute: Number,
            isExcessive: Boolean
          },
          gaze: {
            stabilityScore: Number,
            isStable: Boolean
          },
          smiles: {
            percentage: Number,
            genuine: Number,
            forced: Number,
            authenticityRatio: Number
          },
          tension: {
            average: Number,
            max: Number,
            isHigh: Boolean
          },
          microExpressions: {
            count: Number,
            types: Schema.Types.Mixed
          }
        },
        strengths: [
          {
            metric: String,
            score: Number,
            icon: String,
            message: String,
            impact: String
          }
        ],
        weaknesses: [
          {
            metric: String,
            score: Number,
            severity: {
              type: String,
              enum: ['low', 'medium', 'high']
            },
            icon: String,
            issue: String,
            why: String
          }
        ],
        recommendations: [
          {
            priority: {
              type: String,
              enum: ['low', 'medium', 'high']
            },
            area: String,
            issue: String,
            recommendation: String,
            exercise: String,
            impact: String
          }
        ],
        keyInsights: [String]
      },
      default: null
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
    pipoNoteId: {
      type: Schema.Types.ObjectId,
      ref: 'SelfReflection',
      default: null
      // Links to the Pipo note created from this session
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