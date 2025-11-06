import mongoose, { Document } from 'mongoose';
export interface IScenario extends Document {
    title: string;
    description: string;
    levels: number[];
    status: 'draft' | 'published' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IScenario, {}, {}, {}, mongoose.Document<unknown, {}, IScenario, {}, {}> & IScenario & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Scenario.d.ts.map