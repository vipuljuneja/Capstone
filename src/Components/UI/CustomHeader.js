import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '../../../assets/icons/back.svg';

const HEADER_HEIGHT = 56;

export default function CustomHeader({
  title,
  onLeftPress,
  leftIcon,
  hideIcons = false,
  safeAreaColor = '#fff',
  headerColor = '#fff',
  rightComponent,
  safeAreaAdded = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Top Safe Area */}
      {safeAreaAdded && (
        <View style={{ height: insets.top, backgroundColor: safeAreaColor }} />
      )}
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: headerColor, height: HEADER_HEIGHT },
        ]}
      >
        {!hideIcons && (
          <>
            <TouchableOpacity onPress={onLeftPress} style={styles.leftButton}>
              {leftIcon || <BackIcon width={24} height={24} />}
            </TouchableOpacity>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {/* Optional right side */}
            <View style={styles.rightPlaceholder}>
              {rightComponent || null}
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 0.5,
  },
  leftButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: '100%',
    paddingLeft: 8,
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 8,
  },
  rightPlaceholder: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
