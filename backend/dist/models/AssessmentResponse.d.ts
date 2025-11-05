import mongoose, { Document, Types } from 'mongoose';
interface IResponse {
    order: number;
    value: number;
}
interface IDerived {
    totalScore: number;
    severityLevel: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
    recommendedTracks: string[];
}
export interface IAssessmentResponse extends Document {
    userId: Types.ObjectId;
    templateId: Types.ObjectId;
    responses: IResponse[];
    derived: IDerived;
    notes: string | null;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAssessmentResponse, {}, {}, {}, mongoose.Document<unknown, {}, IAssessmentResponse, {}, {}> & IAssessmentResponse & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AssessmentResponse.d.ts.map