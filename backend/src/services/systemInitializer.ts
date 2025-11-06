import mongoose from 'mongoose';
// Note: sampleScenarios service doesn't exist yet - commenting out for now
// import { createSampleScenarios } from './sampleScenarios';
import Scenario from '../models/Scenario';
// Note: UserPerformance model doesn't exist - using Progress model instead
// import UserPerformance from '../models/UserPerformance';
import Progress from '../models/Progress';
import PracticeSession from '../models/PracticeSession';

/**
 * Initialize the adaptive system with sample data
 */
export const initializeAdaptiveSystem = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Adaptive System...');
    
    // Check if scenarios already exist
    const existingScenarios = await Scenario.find({});
    
    if (existingScenarios.length > 0) {
      console.log(`✅ Found ${existingScenarios.length} existing scenarios, skipping creation`);
      return;
    }
    
    // TODO: Create sample scenarios service
    // await createSampleScenarios();
    console.log('⚠️  Sample scenarios creation not yet implemented');
    
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
    const scenarioCount = await Scenario.countDocuments();
    const performanceCount = await Progress.countDocuments();
    const sessionCount = await PracticeSession.countDocuments();
    
    console.log('📊 System Health Check:');
    console.log(`   - Scenarios: ${scenarioCount}`);
    console.log(`   - User Progress Records: ${performanceCount}`);
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
