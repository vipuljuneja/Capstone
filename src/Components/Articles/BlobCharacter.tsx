import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import { characterImageFor } from './characterImages';

type BlobCharacterProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
  character?: string;
};

export default function BlobCharacter({
  color = '#f5f3ff',
  style,
  character
}: BlobCharacterProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Image
        source={characterImageFor(character)}
        style={styles.image}
        resizeMode="contain"
      />
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
  image: {
    width: '75%',
    height: '75%'
  }
});
