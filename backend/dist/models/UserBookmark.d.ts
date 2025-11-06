import mongoose, { Document, Types } from 'mongoose';
export interface IUserBookmark extends Document {
    userId: Types.ObjectId;
    articleId: Types.ObjectId;
    bookmarkedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUserBookmark, {}, {}, {}, mongoose.Document<unknown, {}, IUserBookmark, {}, {}> & IUserBookmark & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=UserBookmark.d.ts.map