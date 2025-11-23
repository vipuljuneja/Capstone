// src/components/Level2Header.js
import React, { useMemo, memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import BackIcon from '../../../assets/icons/back.svg';

const LevelHeader = memo(({ currentIndex, totalQuestions, onBackPress }) => {
  const progress = useMemo(
    () => ((currentIndex + 1) / totalQuestions) * 100,
    [currentIndex, totalQuestions],
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backButtonContainer}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <BackIcon width={20} height={20} style={styles.backButton} />
      </TouchableOpacity>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    gap: 15,
  },
  backButtonContainer: {
    padding: 8,
  },
  backButton: {
    fontSize: 28,
  },
  progressBarContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: '95%',
    height: 14,
    borderRadius: 9,
    backgroundColor: '#e2e2e2',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#463855',
    borderRadius: 9,
  },
});

export default LevelHeader;
