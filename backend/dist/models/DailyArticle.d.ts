import mongoose, { Document } from 'mongoose';
export interface IDailyArticle extends Document {
    date: string;
    title: string;
    content: string;
    keywords: string[];
    readTime: number;
    author?: string;
    sourceUrl?: string;
    illustrationData: {
        character: string;
        backgroundColor: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDailyArticle, {}, {}, {}, mongoose.Document<unknown, {}, IDailyArticle, {}, {}> & IDailyArticle & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=DailyArticle.d.ts.map