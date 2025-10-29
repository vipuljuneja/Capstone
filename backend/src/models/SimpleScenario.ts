import mongoose, { Schema, Document } from 'mongoose';

export interface IScenario extends Document {
  id: number; // 1, 2, 3 for Coffee, Restaurant, Shopping
  title: string;
  description: string;
  emoji: string;
  level1: {
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>;
  };
  level2: {
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>;
  };
  level3: {
    questions: Array<{
      order: number;
      text: string;
      videoUrl: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  order: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const LevelSchema = new Schema({
  questions: {
    type: [QuestionSchema],
    required: true
  }
}, { _id: false });

const ScenarioSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 3,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    emoji: {
      type: String,
      required: true,
      trim: true
    },
    level1: {
      type: LevelSchema,
      required: true
    },
    level2: {
      type: LevelSchema,
      required: true
    },
    level3: {
      type: LevelSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IScenario>('SimpleScenario', ScenarioSchema);
