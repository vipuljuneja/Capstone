/**
 * Make authenticated API request
 */
declare const apiRequest: (endpoint: string, options?: RequestInit, token?: string) => Promise<any>;
/**
 * User API endpoints
 */
export declare const userAPI: {
    /**
     * Register user after Firebase signup
     */
    register: (name: string, email: string) => Promise<any>;
    /**
     * Get current user profile
     */
    getCurrentUser: () => Promise<any>;
    /**
     * Update user profile
     */
    updateProfile: (data: {
        name?: string;
        profile?: {
            severityLevel?: "Minimal" | "Mild" | "Moderate" | "Severe";
            focusHints?: string[];
        };
    }) => Promise<any>;
    /**
     * Update user streak (after completing a practice session)
     */
    updateStreak: () => Promise<any>;
    /**
     * Get user by ID (for community features)
     */
    getUserById: (userId: string) => Promise<any>;
};
export default apiRequest;
//# sourceMappingURL=api.d.ts.map