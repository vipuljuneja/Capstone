import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getUserLevelQuestions } from './api';

const STORAGE_KEY = 'pending_video_checks';
const POLL_INTERVAL = 15000; // Poll every 15 seconds
const MAX_POLL_ATTEMPTS = 40; // Poll for up to 10 minutes (40 * 15 seconds)

// Motivational messages for level ready notifications
const LEVEL_READY_MESSAGES = [
  "👀 Hey… It's PIP. Your next level is waiting. Just saying.",
  "💪 Tiny reminder: Confidence grows when you practice. You in?",
  "🎯 Level 2 is feeling ignored. Go show it some love.",
  "📈 Your progress graph called — it misses you.",
  "✨ Imagine future-you thanking you for tapping this. Go practice!",
  "🕓 One minute of practice today = zero guilt later. Deal?",
  "🤝 Your comfort zone filed a complaint. Let's step out a bit.",
  "🌱 Confidence won't grow by itself… but you already know that 😉",
  "🔥 You're one level away from surprising yourself. Let's do it!",
  "💬 Your communication skills have entered the chat. They need attention.",
];

/**
 * Get a random motivational message
 */
const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * LEVEL_READY_MESSAGES.length);
  return LEVEL_READY_MESSAGES[randomIndex];
};

/**
 * Add a video check request when a level is completed
 */
export const addVideoCheck = async (userId, scenarioId, nextLevel) => {
  try {
    if (!userId || !scenarioId || !nextLevel) {
      console.warn('⚠️ Cannot add video check: missing userId, scenarioId, or nextLevel');
      return;
    }

    const key = `${userId}_${scenarioId}_${nextLevel}`;
    const check = {
      userId: String(userId),
      scenarioId: String(scenarioId),
      nextLevel: Number(nextLevel),
      addedAt: Date.now(),
      pollCount: 0,
      notified: false,
    };

    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const checks = existing ? JSON.parse(existing) : {};
    checks[key] = check;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
    console.log('📝 Added video check:', key);
  } catch (error) {
    console.error('❌ Failed to add video check:', error);
  }
};

/**
 * Remove a video check after notification is shown
 */
const removeVideoCheck = async (key) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing) {
      const checks = JSON.parse(existing);
      delete checks[key];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
      console.log('✅ Removed video check:', key);
    }
  } catch (error) {
    console.error('❌ Failed to remove video check:', error);
  }
};

/**
 * Show a Toast notification for level ready
 */
const showLevelReadyToast = (level, scenarioId, scenarioTitle) => {
  try {
    const message = getRandomMessage();
    const title = level === 2 ? 'Level 2 is Ready!' : 'Level 3 is Ready!';

    Toast.show({
      type: 'videoReady',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
      props: {
        scenarioId: String(scenarioId),
        level: Number(level),
        scenarioTitle: String(scenarioTitle || ''),
      },
      onPress: () => {
        Toast.hide();
      },
    });
    console.log('✅ Toast notification shown:', { level, scenarioId, message });
  } catch (error) {
    console.error('❌ Failed to show Toast notification:', error);
  }
};

/**
 * Check if videos are ready by fetching questions and checking videoUrls
 */
const checkVideosReady = async (userId, scenarioId, level) => {
  try {
    const levelKey = `level${level}`;
    const questionsData = await getUserLevelQuestions(userId, scenarioId, levelKey);
    const questions = questionsData?.questions || [];
    
    if (questions.length === 0) {
      return { ready: false, totalQuestions: 0, readyCount: 0 };
    }

    const totalQuestions = questions.length;
    const readyCount = questions.filter(q => q.videoUrl && q.videoUrl.startsWith('http')).length;
    const allReady = readyCount === totalQuestions;

    return { ready: allReady, totalQuestions, readyCount };
  } catch (error) {
    console.error('❌ Error checking video readiness:', error);
    return { ready: false, totalQuestions: 0, readyCount: 0 };
  }
};

/**
 * Poll for a single video check
 */
const pollVideoCheck = async (key, check) => {
  try {
    if (!check || check.notified) {
      return; // Already notified or invalid check
    }

    const { userId, scenarioId, nextLevel, pollCount } = check;

    if (pollCount >= MAX_POLL_ATTEMPTS) {
      console.log(`⏱️ Stopped polling for ${key} (max attempts reached)`);
      await removeVideoCheck(key);
      return;
    }

    // Update poll count
    const updatedCheck = { ...check, pollCount: pollCount + 1 };
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const checks = existing ? JSON.parse(existing) : {};
    checks[key] = updatedCheck;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checks));

    // Check video readiness
    const result = await checkVideosReady(userId, scenarioId, nextLevel);

    if (result.ready) {
      console.log('✅ Videos are ready for:', { key, level: nextLevel, scenarioId });
      showLevelReadyToast(nextLevel, scenarioId, check.scenarioTitle);
      await removeVideoCheck(key);
    }
  } catch (error) {
    console.error('❌ Error polling video check:', error);
  }
};

let pollingInterval = null;
let isPollingActive = false;

/**
 * Start global polling for all pending video checks
 */
export const startVideoPolling = (userId) => {
  if (isPollingActive || !userId) {
    return;
  }
  isPollingActive = true;
  console.log('🚀 Starting global video polling for user:', userId);

  const pollAll = async () => {
    try {
      const existingChecks = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingChecks) {
        return;
      }

      const checks = JSON.parse(existingChecks);
      const userChecks = Object.entries(checks).filter(([key, check]) => check.userId === userId);

      if (userChecks.length === 0) {
        console.log('⏱️ No pending video checks, stopping polling.');
        stopVideoPolling();
        return;
      }

      await Promise.allSettled(
        userChecks.map(([key, check]) => pollVideoCheck(key, check))
      );
    } catch (error) {
      console.error('❌ Error in global video polling loop:', error);
    }
  };

  // Start immediately and then at intervals
  pollAll();
  pollingInterval = setInterval(pollAll, POLL_INTERVAL);
};

/**
 * Stop global video polling
 */
export const stopVideoPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isPollingActive = false;
  console.log('🛑 Stopped global video polling.');
};

