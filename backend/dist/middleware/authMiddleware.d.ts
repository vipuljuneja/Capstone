import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email: string;
                userId?: string;
            };
        }
    }
}
/**
 * Middleware to verify Firebase JWT token
 * Extracts token from Authorization header and verifies it
 */
export declare const verifyFirebaseToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional middleware - only verifies if token exists
 * Useful for endpoints that work with or without auth
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to verify that the authenticated user matches the :authUid parameter
 * Must be used after verifyFirebaseToken
 */
export declare const verifyUserOwnership: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map