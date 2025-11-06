"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSystemHealth = exports.initializeAdaptiveSystem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Note: sampleScenarios service doesn't exist yet - commenting out for now
// import { createSampleScenarios } from './sampleScenarios';
const Scenario_1 = __importDefault(require("../models/Scenario"));
// Note: UserPerformance model doesn't exist - using Progress model instead
// import UserPerformance from '../models/UserPerformance';
const Progress_1 = __importDefault(require("../models/Progress"));
const PracticeSession_1 = __importDefault(require("../models/PracticeSession"));
/**
 * Initialize the adaptive system with sample data
 */
const initializeAdaptiveSystem = async () => {
    try {
        console.log('🚀 Initializing Adaptive System...');
        // Check if scenarios already exist
        const existingScenarios = await Scenario_1.default.find({});
        if (existingScenarios.length > 0) {
            console.log(`✅ Found ${existingScenarios.length} existing scenarios, skipping creation`);
            return;
        }
        // TODO: Create sample scenarios service
        // await createSampleScenarios();
        console.log('⚠️  Sample scenarios creation not yet implemented');
        console.log('✅ Adaptive system initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize adaptive system:', error);
        throw error;
    }
};
exports.initializeAdaptiveSystem = initializeAdaptiveSystem;
/**
 * Check system health
 */
const checkSystemHealth = async () => {
    try {
        console.log('🔍 Checking system health...');
        // Check database connection
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        // Check if models are accessible
        const scenarioCount = await Scenario_1.default.countDocuments();
        const performanceCount = await Progress_1.default.countDocuments();
        const sessionCount = await PracticeSession_1.default.countDocuments();
        console.log('📊 System Health Check:');
        console.log(`   - Scenarios: ${scenarioCount}`);
        console.log(`   - User Progress Records: ${performanceCount}`);
        console.log(`   - Practice Sessions: ${sessionCount}`);
        console.log(`   - Database Status: Connected`);
        console.log('✅ System health check passed');
    }
    catch (error) {
        console.error('❌ System health check failed:', error);
        throw error;
    }
};
exports.checkSystemHealth = checkSystemHealth;
exports.default = {
    initializeAdaptiveSystem: exports.initializeAdaptiveSystem,
    checkSystemHealth: exports.checkSystemHealth
};
//# sourceMappingURL=systemInitializer.js.map