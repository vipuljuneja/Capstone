import mongoose, { Document } from 'mongoose';
export interface IScenario extends Document {
    id: number;
    title: string;
    description: string;
    emoji: string;
    level1: {
        questions: Array<{
            order: number;
            text: string;
            videoUrl: string;
        }>;
    };
    level2: {
        questions: Array<{
            order: number;
            text: string;
            videoUrl: string;
        }>;
    };
    level3: {
        questions: Array<{
            order: number;
            text: string;
            videoUrl: string;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IScenario, {}, {}, {}, mongoose.Document<unknown, {}, IScenario, {}, {}> & IScenario & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SimpleScenario.d.ts.map