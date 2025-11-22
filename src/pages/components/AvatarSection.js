// src/components/AvatarSection.js
import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import AvatarGenerator from '../../Components/Avatar/AvatarGenerate';

const AvatarSection = forwardRef(
  ({ imgURL, lines, videoUrls, onStateChange, onInitialized }, ref) => {
    return (
      <View style={styles.container}>
        <AvatarGenerator
          ref={ref}
          onStateChange={onStateChange}
          onInitialized={onInitialized}
          imgURL={imgURL}
          lines={lines}
          videoUrls={videoUrls}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default AvatarSection;
