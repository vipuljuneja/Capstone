import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type BlobCharacterProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export default function BlobCharacter({
  color = '#e0f2e9',
  style
}: BlobCharacterProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <View style={styles.blob}>
        <View style={styles.blobFace}>
          <View style={styles.blobEyes}>
            <View style={styles.blobEye} />
            <View style={styles.blobEye} />
          </View>
          <View style={styles.blobMouth} />
        </View>
        <View style={styles.blobHand} />
        <View style={styles.blobLegs}>
          <View style={styles.blobLeg} />
          <View style={styles.blobLeg} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blob: {
    alignItems: 'center'
  },
  blobFace: {
    width: 80,
    height: 80,
    backgroundColor: '#a78bfa',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blobEyes: {
    flexDirection: 'row',
    gap: 16
  },
  blobEye: {
    width: 8,
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4
  },
  blobMouth: {
    width: 20,
    height: 10,
    backgroundColor: '#c084fc',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 8
  },
  blobHand: {
    width: 30,
    height: 40,
    backgroundColor: '#a78bfa',
    borderRadius: 15,
    position: 'absolute',
    right: -20,
    top: 30,
    transform: [{ rotate: '20deg' }]
  },
  blobLegs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  blobLeg: {
    width: 24,
    height: 32,
    backgroundColor: '#a78bfa',
    borderRadius: 12
  }
});
