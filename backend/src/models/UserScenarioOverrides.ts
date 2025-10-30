import mongoose, { Schema, Document } from 'mongoose';

export interface IUserScenarioOverrides extends Document {
  userId: mongoose.Types.ObjectId;
  scenarioId: mongoose.Types.ObjectId;
  level2?: {
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>;
  };
  level3?: {
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    order: { type: Number, required: true },
    text: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const LevelSchema = new Schema(
  {
    questions: { type: [QuestionSchema], required: true }
  },
  { _id: false }
);

const UserScenarioOverridesSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenarioId: { type: Schema.Types.ObjectId, ref: 'SimpleScenario', required: true, index: true },
    level2: { type: LevelSchema, required: false },
    level3: { type: LevelSchema, required: false }
  },
  { timestamps: true }
);

UserScenarioOverridesSchema.index({ userId: 1, scenarioId: 1 }, { unique: true });

export default mongoose.model<IUserScenarioOverrides>('UserScenarioOverrides', UserScenarioOverridesSchema);


