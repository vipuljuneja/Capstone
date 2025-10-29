import mongoose from 'mongoose';
import { createSampleScenarios } from './sampleScenarios';
import EnhancedScenario from '../models/EnhancedScenario';
import UserPerformance from '../models/UserPerformance';
import PracticeSession from '../models/PracticeSession';

/**
 * Initialize the adaptive system with sample data
 */
export const initializeAdaptiveSystem = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Adaptive System...');
    
    // Check if scenarios already exist
    const existingScenarios = await EnhancedScenario.find({});
    
    if (existingScenarios.length > 0) {
      console.log(`✅ Found ${existingScenarios.length} existing scenarios, skipping creation`);
      return;
    }
    
    // Create sample scenarios
    await createSampleScenarios();
    
    console.log('✅ Adaptive system initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize adaptive system:', error);
    throw error;
  }
};

/**
 * Check system health
 */
export const checkSystemHealth = async (): Promise<void> => {
  try {
    console.log('🔍 Checking system health...');
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    // Check if models are accessible
    const scenarioCount = await EnhancedScenario.countDocuments();
    const performanceCount = await UserPerformance.countDocuments();
    const sessionCount = await PracticeSession.countDocuments();
    
    console.log('📊 System Health Check:');
    console.log(`   - Enhanced Scenarios: ${scenarioCount}`);
    console.log(`   - User Performance Records: ${performanceCount}`);
    console.log(`   - Practice Sessions: ${sessionCount}`);
    console.log(`   - Database Status: Connected`);
    
    console.log('✅ System health check passed');
  } catch (error: any) {
    console.error('❌ System health check failed:', error);
    throw error;
  }
};

export default {
  initializeAdaptiveSystem,
  checkSystemHealth
};
