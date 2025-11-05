import { Request, Response } from 'express';
export declare const getTodayArticle: (req: Request, res: Response) => Promise<void>;
export declare const getLast7DaysArticles: (req: Request, res: Response) => Promise<void>;
export declare const getArticleById: (req: Request, res: Response) => Promise<void>;
export declare const bookmarkArticle: (req: Request, res: Response) => Promise<void>;
export declare const removeBookmark: (req: Request, res: Response) => Promise<void>;
export declare const getUserBookmarkedArticles: (req: Request, res: Response) => Promise<void>;
export declare const generateTodayArticleManually: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=articleController.d.ts.map