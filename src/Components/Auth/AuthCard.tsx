import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface AuthCardProps {
  title: string;
  children: ReactNode;
  blobImage?: ImageSourcePropType;
  blobTopMargin?: number;
  style?: ViewStyle;
}

const blobCharacter = require('../../../assets/pipo/loginPipo.png');

export default function AuthCard({
  title,
  children,
  blobImage = blobCharacter,
  blobTopMargin = 110,
  style,
}: AuthCardProps) {
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
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: -19,
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
});

