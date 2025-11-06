import mongoose, { Document, Types } from 'mongoose';
interface ISource {
    image: {
        bucket: string;
        key: string;
    };
    voiceId: string;
    promptText: string;
}
interface IOutput {
    bucket: string;
    key: string;
}
export interface IMediaJob extends Document {
    scenarioId: Types.ObjectId;
    level: number;
    questionOrder: number;
    provider: string;
    jobId: string;
    status: 'queued' | 'rendering' | 'uploaded' | 'published' | 'failed';
    requestedAt: Date;
    error: string | null;
    source: ISource;
    output: IOutput | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMediaJob, {}, {}, {}, mongoose.Document<unknown, {}, IMediaJob, {}, {}> & IMediaJob & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=MediaJob.d.ts.map