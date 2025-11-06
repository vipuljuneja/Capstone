import { IPracticeSession } from '../models/PracticeSession';
interface PipoMessageContent {
    title: string;
    body: string;
    imageName: string;
}
/**
 * Generates a friendly Pipo message from a practice session
 */
export declare const generatePipoMessageFromSession: (session: IPracticeSession) => Promise<PipoMessageContent>;
/**
 * Generates a simple summary for quick display
 */
export declare const generateQuickSummary: (session: IPracticeSession) => string;
export {};
//# sourceMappingURL=pipoMessageService.d.ts.map