"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserOwnership = exports.optionalAuth = exports.verifyFirebaseToken = void 0;
const firebase_1 = require("../config/firebase");
const models_1 = require("../models");
/**
 * Middleware to verify Firebase JWT token
 * Extracts token from Authorization header and verifies it
 */
const verifyFirebaseToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                status: 'error',
                message: 'No authorization token provided'
            });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid token format'
            });
            return;
        }
        // Verify token with Firebase
        const decodedToken = await firebase_1.firebaseAdmin.auth().verifyIdToken(token);
        // Find user in MongoDB by Firebase UID
        const user = await models_1.User.findOne({ authUid: decodedToken.uid });
        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            userId: user?._id ? user._id.toString() : undefined
        };
        next();
    }
    catch (error) {
        console.error('❌ Auth error:', error);
        if (error.code === 'auth/id-token-expired') {
            res.status(401).json({
                status: 'error',
                message: 'Token expired. Please login again.'
            });
            return;
        }
        if (error.code === 'auth/argument-error') {
            res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
            return;
        }
        res.status(401).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
/**
 * Optional middleware - only verifies if token exists
 * Useful for endpoints that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await firebase_1.firebaseAdmin.auth().verifyIdToken(token);
            const user = await models_1.User.findOne({ authUid: decodedToken.uid });
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email || '',
                userId: user?._id ? user._id.toString() : undefined
            };
        }
        next();
    }
    catch (error) {
        // Don't block request if optional auth fails
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Middleware to verify that the authenticated user matches the :authUid parameter
 * Must be used after verifyFirebaseToken
 */
const verifyUserOwnership = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }
    const { authUid } = req.params;
    if (authUid && req.user.uid !== authUid) {
        res.status(403).json({
            status: 'error',
            message: 'Forbidden: You can only access your own resources'
        });
        return;
    }
    next();
};
exports.verifyUserOwnership = verifyUserOwnership;
//# sourceMappingURL=authMiddleware.js.map