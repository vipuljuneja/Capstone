import mongoose, { Document } from 'mongoose';
interface IScaleLabels {
    min: number;
    max: number;
    labels: string[];
}
interface IAssessmentItem {
    order: number;
    prompt: string;
}
export interface IAssessmentTemplate extends Document {
    title: string;
    scale: IScaleLabels;
    items: IAssessmentItem[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAssessmentTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IAssessmentTemplate, {}, {}> & IAssessmentTemplate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AssessmentTemplate.d.ts.map