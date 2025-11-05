import mongoose, { Document } from 'mongoose';
export interface IAchievement extends Document {
    key: string;
    title: string;
    description: string;
    icon: string;
    category: 'session' | 'progress' | 'streak' | 'skill';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAchievement, {}, {}, {}, mongoose.Document<unknown, {}, IAchievement, {}, {}> & IAchievement & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Achievement.d.ts.map