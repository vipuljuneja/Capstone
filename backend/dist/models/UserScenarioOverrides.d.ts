import mongoose, { Document } from 'mongoose';
export interface IUserScenarioOverrides extends Document {
    userId: mongoose.Types.ObjectId;
    scenarioId: mongoose.Types.ObjectId;
    level2?: {
        questions: Array<{
            order: number;
            text: string;
            videoUrl: string;
        }>;
    };
    level3?: {
        questions: Array<{
            order: number;
            text: string;
            videoUrl: string;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUserScenarioOverrides, {}, {}, {}, mongoose.Document<unknown, {}, IUserScenarioOverrides, {}, {}> & IUserScenarioOverrides & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=UserScenarioOverrides.d.ts.map