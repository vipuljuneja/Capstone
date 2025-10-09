import mongoose, { Schema, Document, Types } from 'mongoose';

interface IMedia {
  type: 'avatar_video' | 'image' | 'audio';
  bucket: string;
  key: string;
  provider: string;
  jobId?: string;
}

interface IQuestion {
  order: number;
  text: string;
  media: IMedia;
}

interface IRubric {
  pace: {
    targetWpm: number[];
  };
  fillers: {
    maxPerMin: number;
    keywords: string[];
  };
  pauses: {
    minCount: number;
    maxCount: number;
  };
  tone: {
    neutrality: number[];
    warmth: string;
  };
  eyeContact: {
    enabled: boolean;
  };
  smile: {
    enabled: boolean;
  };
  completion: {
    requiredSteps: number[];
  };
}

export interface ILevelPrompt extends Document {
  scenarioId: Types.ObjectId;
  level: number;
  introScript: string;
  questionSet: IQuestion[];
  rubric: IRubric;
  aiSystemPrompt: string;
  aiScoringPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

const LevelPromptSchema: Schema = new Schema(
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
    introScript: {
      type: String,
      required: true,
      trim: true
    },
    questionSet: [
      {
        order: {
          type: Number,
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        media: {
          type: {
            type: String,
            enum: ['avatar_video', 'image', 'audio'],
            required: true
          },
          bucket: {
            type: String,
            required: true
          },
          key: {
            type: String,
            required: true
          },
          provider: {
            type: String,
            required: true
          },
          jobId: {
            type: String
          }
        }
      }
    ],
    rubric: {
      pace: {
        targetWpm: {
          type: [Number],
          required: true
        }
      },
      fillers: {
        maxPerMin: {
          type: Number,
          required: true
        },
        keywords: {
          type: [String],
          required: true
        }
      },
      pauses: {
        minCount: {
          type: Number,
          required: true
        },
        maxCount: {
          type: Number,
          required: true
        }
      },
      tone: {
        neutrality: {
          type: [Number],
          required: true
        },
        warmth: {
          type: String,
          required: true
        }
      },
      eyeContact: {
        enabled: {
          type: Boolean,
          default: false
        }
      },
      smile: {
        enabled: {
          type: Boolean,
          default: false
        }
      },
      completion: {
        requiredSteps: {
          type: [Number],
          required: true
        }
      }
    },
    aiSystemPrompt: {
      type: String,
      required: true
    },
    aiScoringPrompt: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for quick level lookup
LevelPromptSchema.index({ scenarioId: 1, level: 1 }, { unique: true });

export default mongoose.model<ILevelPrompt>('LevelPrompt', LevelPromptSchema);