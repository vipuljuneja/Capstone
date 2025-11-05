import { Request, Response } from 'express';
export declare const createUser: (req: Request, res: Response) => Promise<void>;
export declare const getUserByAuthUid: (req: Request, res: Response) => Promise<void>;
export declare const updateUserProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateOnboardingStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateHasSeenTour: (req: Request, res: Response) => Promise<void>;
export declare const updateSeverityLevel: (req: Request, res: Response) => Promise<void>;
export declare const updateUserStreak: (req: Request, res: Response) => Promise<void>;
export declare const addUserAchievement: (req: Request, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map