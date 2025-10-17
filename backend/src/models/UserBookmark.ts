import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserBookmark extends Document {
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  bookmarkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserBookmarkSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'DailyArticle',
      required: true,
      index: true
    },
    bookmarkedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

UserBookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });
UserBookmarkSchema.index({ userId: 1, bookmarkedAt: -1 });

export default mongoose.model<IUserBookmark>('UserBookmark', UserBookmarkSchema);
