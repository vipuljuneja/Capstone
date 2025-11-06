import mongoose, { Document, Types } from 'mongoose';
interface IMedia {
    type: 'avatar_video' | 'image' | 'audio';
    bucket: string;
    key: string;
    provider: string;
    jobId?: string;
}
interface IQuestion {
    order: number;
    text: string;
    media: IMedia;
}
interface IRubric {
    pace: {
        targetWpm: number[];
    };
    fillers: {
        maxPerMin: number;
        keywords: string[];
    };
    pauses: {
        minCount: number;
        maxCount: number;
    };
    tone: {
        neutrality: number[];
        warmth: string;
    };
    eyeContact: {
        enabled: boolean;
    };
    smile: {
        enabled: boolean;
    };
    completion: {
        requiredSteps: number[];
    };
}
export interface ILevelPrompt extends Document {
    scenarioId: Types.ObjectId;
    level: number;
    introScript: string;
    questionSet: IQuestion[];
    rubric: IRubric;
    aiSystemPrompt: string;
    aiScoringPrompt: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILevelPrompt, {}, {}, {}, mongoose.Document<unknown, {}, ILevelPrompt, {}, {}> & ILevelPrompt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=LevelPrompt.d.ts.map