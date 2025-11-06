import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    authUid: string;
    email: string;
    name: string;
    avatarImage?: string;
    hasSeenTour?: boolean;
    onboarding: {
        completed: boolean;
        completedAt: Date | null;
    };
    profile: {
        severityLevel: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
        focusHints: string[];
    };
    streak: {
        current: number;
        longest: number;
        lastActiveAt: Date;
    };
    achievements: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map