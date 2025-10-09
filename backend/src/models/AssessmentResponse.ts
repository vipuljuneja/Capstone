import mongoose, { Schema, Document, Types } from 'mongoose';

interface IResponse {
  order: number;
  value: number;
}

interface IDerived {
  totalScore: number;
  severityLevel: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  recommendedTracks: string[];
}

export interface IAssessmentResponse extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  responses: IResponse[];
  derived: IDerived;
  notes: string | null;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentResponseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentTemplate',
      required: true,
      index: true
    },
    responses: [
      {
        order: {
          type: Number,
          required: true
        },
        value: {
          type: Number,
          required: true,
          min: 0,
          max: 3
        }
      }
    ],
    derived: {
      totalScore: {
        type: Number,
        required: true
      },
      severityLevel: {
        type: String,
        enum: ['Minimal', 'Mild', 'Moderate', 'Severe'],
        required: true
      },
      recommendedTracks: {
        type: [String],
        default: []
      }
    },
    notes: {
      type: String,
      default: null
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
AssessmentResponseSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model<IAssessmentResponse>('AssessmentResponse', AssessmentResponseSchema);
