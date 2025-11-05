import admin from 'firebase-admin';
declare let firebaseAdmin: admin.app.App;
export { firebaseAdmin };
export declare const verifyToken: (token: string) => Promise<import("firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
//# sourceMappingURL=firebase.d.ts.map