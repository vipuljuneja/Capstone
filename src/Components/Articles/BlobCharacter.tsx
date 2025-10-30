import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle
} from 'react-native';
import { characterImageFor } from './characterImages';

type BlobCharacterProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
  character?: string;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

export default function BlobCharacter({
  color = 'transparent',
  style,
  character,
  imageStyle,
  resizeMode = 'contain'
}: BlobCharacterProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Image
        source={characterImageFor(character)}
        style={[styles.image, imageStyle]} 
        resizeMode={resizeMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',  
    height: '100%',  
    borderRadius: 16,
  },
});
