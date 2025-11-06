"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = __importDefault(require("./routes/routes"));
dotenv_1.default.config();
console.log('🔍 GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'PiP API is running',
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'PiP API',
        version: '1.0.0',
        description: 'Practice in Peace - Social Anxiety App Backend',
        endpoints: {
            health: '/health',
            api: '/api',
            users: '/api/users'
        }
    });
});
// API Routes
app.use('/api', routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
// Global error handler
app.use((err, req, res) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
// Start server
const startServer = async () => {
    try {
        await (0, database_1.default)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map