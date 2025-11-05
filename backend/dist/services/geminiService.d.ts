interface GeneratedArticle {
    title: string;
    content: string;
    keywords: string[];
    readTime: number;
    author?: string;
    sourceUrl?: string;
}
export declare const generateDailyArticle: () => Promise<GeneratedArticle>;
export {};
//# sourceMappingURL=geminiService.d.ts.map