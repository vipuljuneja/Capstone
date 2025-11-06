import mongoose, { Document, Types } from 'mongoose';
interface ILevelProgress {
    attempts: number;
    lastCompletedAt: Date | null;
    achievements: string[];
    unlockedAt: Date | null;
}
export interface IProgress extends Document {
    userId: Types.ObjectId;
    scenarioId: Types.ObjectId;
    levels: Map<string, ILevelProgress>;
    totalSessions: number;
    lastPlayedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProgress, {}, {}, {}, mongoose.Document<unknown, {}, IProgress, {}, {}> & IProgress & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Progress.d.ts.map