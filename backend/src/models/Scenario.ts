import mongoose, { Schema, Document } from 'mongoose';

export interface IScenario extends Document {
  title: string;
  description: string;
  levels: number[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    levels: {
      type: [Number],
      required: true,
      default: [1, 2, 3]
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for home screen queries (only published scenarios)
ScenarioSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IScenario>('Scenario', ScenarioSchema);