import mongoose, { Schema, Document } from 'mongoose';

interface IScaleLabels {
  min: number;
  max: number;
  labels: string[];
}

interface IAssessmentItem {
  order: number;
  prompt: string;
}

export interface IAssessmentTemplate extends Document {
  title: string;
  scale: IScaleLabels;
  items: IAssessmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentTemplateSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    scale: {
      min: {
        type: Number,
        required: true,
        default: 0
      },
      max: {
        type: Number,
        required: true,
        default: 3
      },
      labels: {
        type: [String],
        required: true
      }
    },
    items: [
      {
        order: {
          type: Number,
          required: true
        },
        prompt: {
          type: String,
          required: true,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for quick template retrieval
AssessmentTemplateSchema.index({ title: 1 });

export default mongoose.model<IAssessmentTemplate>('AssessmentTemplate', AssessmentTemplateSchema);