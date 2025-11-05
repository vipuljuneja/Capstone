import mongoose, { Document, Types } from 'mongoose';
export interface IEncouragementNote extends Document {
    userId: Types.ObjectId;
    date: string;
    title: string;
    body: string;
    tags: string[];
    linkedSessionId: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEncouragementNote, {}, {}, {}, mongoose.Document<unknown, {}, IEncouragementNote, {}, {}> & IEncouragementNote & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=EncouragementNote.d.ts.map