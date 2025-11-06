import { Request, Response } from 'express';
export declare const startPracticeSession: (req: Request, res: Response) => Promise<void>;
export declare const addStepToSession: (req: Request, res: Response) => Promise<void>;
export declare const completeSession: (req: Request, res: Response) => Promise<void>;
export declare const abandonSession: (req: Request, res: Response) => Promise<void>;
export declare const getUserSessions: (req: Request, res: Response) => Promise<void>;
export declare const getSessionById: (req: Request, res: Response) => Promise<void>;
export declare const deleteSession: (req: Request, res: Response) => Promise<void>;
/**
 * Create a complete practice session in one go
 * This is useful when the frontend has all data ready (steps + facial analysis)
 */
export declare const createCompleteSession: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=practiceSessionController.d.ts.map