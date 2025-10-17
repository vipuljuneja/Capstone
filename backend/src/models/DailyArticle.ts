import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyArticle extends Document {
  date: string;
  title: string;
  content: string;
  keywords: string[];
  readTime: number;
  illustrationData: {
    character: string;
    backgroundColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DailyArticleSchema: Schema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    keywords: {
      type: [String],
      default: []
    },
    readTime: {
      type: Number,
      required: true,
      min: 1
    },
    illustrationData: {
      character: {
        type: String,
        default: 'blob'
      },
      backgroundColor: {
        type: String,
        default: '#e0f2e9'
      }
    }
  },
  { timestamps: true }
);

DailyArticleSchema.index({ date: -1 });

export default mongoose.model<IDailyArticle>('DailyArticle', DailyArticleSchema);