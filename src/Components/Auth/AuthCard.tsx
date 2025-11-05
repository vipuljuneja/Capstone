import React, { ReactNode, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AuthCardProps {
  title: string;
  children: ReactNode;
  blobImage?: ImageSourcePropType;
  blobTopMargin?: number;
  style?: ViewStyle;
  coverEyes?: boolean;
}

const blobCharacter = require('../../../assets/pipo/loginPipo.png');

export default function AuthCard({
  title,
  children,
  blobImage = blobCharacter,
  blobTopMargin = 110,
  style,
  coverEyes = false,
}: AuthCardProps) {
  const pawCoverProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pawCoverProgress, {
      toValue: coverEyes ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [coverEyes, pawCoverProgress]);

  const leftArmStyle = [
    styles.leftArm,
    {
      transform: [
        {
          translateY: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [14, -8],
          }),
        },
        {
          translateX: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [-6, 3],
          }),
        },
        {
          rotate: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ['10deg', '38deg'],
          }),
        },
        {
          scaleY: pawCoverProgress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.1, 0.5, 0.85],
          }),
        },
      ],
      opacity: pawCoverProgress.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 0.35, 1],
      }),
      zIndex: coverEyes ? 3 : -56,
    },
  ] as const;
  const pawOpacity = pawCoverProgress.interpolate({
    inputRange: [0, 0.05, 0.2, 1],
    outputRange: [1, 0.85, 0.2, 0],
  });

  const leftPawStyle = [styles.leftPaw, { opacity: pawOpacity }] as const;
  const rightPawStyle = [styles.rightPaw, { opacity: pawOpacity }] as const;

  const rightArmStyle = [
    styles.rightArm,
    {
      transform: [
        {
          translateY: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [14, -8],
          }),
        },
        {
          translateX: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [6, -11],
          }),
        },
        {
          rotate: pawCoverProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ['-10deg', '-38deg'],
          }),
        },
        {
          scaleY: pawCoverProgress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.1, 0.5, 0.85],
          }),
        },
      ],
      opacity: pawCoverProgress.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 0.35, 1],
      }),
      zIndex: coverEyes ? 3 : -1,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F6EAC2', '#EEF3E7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.1, y: 0.5 }}
        locations={[0.2, 0.8]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.blobContainer, { marginTop: blobTopMargin }]}>
        <Image source={blobImage} style={styles.blobImage} />
      </View>
      <View style={[styles.card, style]}>
        <Animated.View pointerEvents="none" style={leftPawStyle} />
        <Animated.View pointerEvents="none" style={rightPawStyle} />
        <Animated.View pointerEvents="none" style={leftArmStyle} />
        <Animated.View pointerEvents="none" style={rightArmStyle} />

        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3e8',
  },
  blobContainer: {
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
  },
  blobImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -40,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginTop: -40,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  leftPaw: {
    position: 'absolute',
    top: -10,
    left: '39%',
    width: 30,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#EC7CFF',
    zIndex: 3,
  },
  rightPaw: {
    position: 'absolute',
    top: -10,
    right: '52%',
    width: 30,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#EC7CFF',
    zIndex: 3,
  },
  leftArm: {
    position: 'absolute',
    top: -32,
    left: '41%',
    width: 24,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EC7CFF',
    zIndex: 0,
  },
  rightArm: {
    position: 'absolute',
    top: -32,
    right: '51%',
    width: 24,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EC7CFF',
    zIndex: 0,
  },
});
