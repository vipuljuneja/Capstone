import { Request, Response } from 'express';
/**
 * Create a new self-reflection entry
 */
export declare const createReflection: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get reflections for a user (with optional filters)
 */
export declare const getReflectionsByUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get a single reflection by ID
 */
export declare const getReflectionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update a reflection
 */
export declare const updateReflection: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Delete a reflection
 */
export declare const deleteReflection: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update read status for a reflection
 * Allows setting readAt to the current time, a specific date, or null (unread)
 */
export declare const updateReflectionReadStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get dates that have reflections for a user (for calendar markers)
 */
export declare const getReflectionDates: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Create a Pipo note from a completed practice session
 */
export declare const createPipoNoteFromSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=selfReflection.controller.d.ts.map