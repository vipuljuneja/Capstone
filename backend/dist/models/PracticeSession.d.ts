import mongoose, { Document, Types } from 'mongoose';
interface IFiller {
    word: string;
    t: number;
}
interface IPause {
    t: number;
    len: number;
}
interface ITone {
    score: number;
    labels: string[];
}
interface IEyeContact {
    available: boolean;
    ratio: number | null;
}
interface ISmile {
    ratio: number | null;
}
interface IMetrics {
    durationSec: number;
    wpm: number;
    fillers: IFiller[];
    pauses: IPause[];
    tone: ITone;
    eyeContact: IEyeContact;
    smile: ISmile;
}
interface IStep {
    order: number;
    startedAt: Date;
    endedAt: Date;
    transcript: string;
    metrics: IMetrics;
}
interface IAggregate {
    wpmAvg: number;
    fillersPerMin: number;
    toneScore: number;
    eyeContactRatio: number | null;
    score: number;
}
interface IFeedbackCard {
    title: string;
    body: string;
    type: 'tip' | 'praise' | 'warning';
}
interface IFacialAnalysisScores {
    eyeContact: number;
    posture: number;
    expressiveness: number;
    composure: number;
    naturalness: number;
}
interface IEyeRollDetail {
    frameIndex: number;
    timestamp: number;
    intensity: number;
    lookUpValue: number;
}
interface IFacialDetailedMetrics {
    eyeRolls: {
        count: number;
        details: IEyeRollDetail[];
    };
    blinking: {
        total: number;
        perMinute: number;
        isExcessive: boolean;
    };
    gaze: {
        stabilityScore: number;
        isStable: boolean;
    };
    smiles: {
        percentage: number;
        genuine: number;
        forced: number;
        authenticityRatio: number;
    };
    tension: {
        average: number;
        max: number;
        isHigh: boolean;
    };
    microExpressions: {
        count: number;
        types: Record<string, number>;
    };
}
interface IFacialStrength {
    metric: string;
    score: number;
    icon: string;
    message: string;
    impact: string;
}
interface IFacialWeakness {
    metric: string;
    score: number;
    severity: 'low' | 'medium' | 'high';
    icon: string;
    issue: string;
    why: string;
}
interface IFacialRecommendation {
    priority: 'low' | 'medium' | 'high';
    area: string;
    issue: string;
    recommendation: string;
    exercise: string;
    impact: string;
}
interface IFacialAnalysis {
    summary: {
        overallScore: number;
        level: string;
        totalFrames: number;
        duration: number;
        timestamp: Date;
    };
    scores: IFacialAnalysisScores;
    detailedMetrics: IFacialDetailedMetrics;
    strengths: IFacialStrength[];
    weaknesses: IFacialWeakness[];
    recommendations: IFacialRecommendation[];
    keyInsights: string[];
}
export interface IPracticeSession extends Document {
    userId: Types.ObjectId;
    scenarioId: Types.ObjectId;
    level: number;
    status: 'active' | 'abandoned' | 'completed';
    steps: IStep[];
    aggregate: IAggregate;
    facialAnalysis: IFacialAnalysis | null;
    aiFeedbackCards: IFeedbackCard[];
    achievementsUnlocked: string[];
    pipoNoteId: Types.ObjectId | null;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPracticeSession, {}, {}, {}, mongoose.Document<unknown, {}, IPracticeSession, {}, {}> & IPracticeSession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=PracticeSession.d.ts.map