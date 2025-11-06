interface SessionDataForAI {
    wpmAvg: number;
    fillersPerMin: number;
    totalFillers: number;
    pauseCount: number;
    avgPauseDuration: number;
    eyeContactRatio: number | null;
    overallScore: number;
    transcript: string;
    duration: number;
    scenarioTitle?: string;
    level: number;
}
interface AIFeedbackCard {
    title: string;
    body: string;
    type: 'tip' | 'praise' | 'warning';
}
interface PipoNoteContent {
    title: string;
    body: string;
}
export declare const generateAIFeedbackCards: (sessionData: SessionDataForAI) => Promise<AIFeedbackCard[]>;
export declare const generatePipoNote: (sessionData: SessionDataForAI) => Promise<PipoNoteContent>;
export declare const prepareSessionDataForAI: (session: any, scenarioTitle?: string) => SessionDataForAI;
export declare const generateNextLevelQuestions: (sessionData: SessionDataForAI & {
    nextLevel: 2 | 3;
    scenarioTitle?: string;
}) => Promise<any>;
export {};
//# sourceMappingURL=practiceSessionAIService.d.ts.map