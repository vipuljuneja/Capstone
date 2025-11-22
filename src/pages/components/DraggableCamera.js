import React, { useState, forwardRef } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';
import CameraDetector from '../../Components/Facial/CameraDetector';

const DraggableCamera = forwardRef(({ onAnalysisComplete }, ref) => {
  const [pan] = useState(new Animated.ValueXY({ x: 20, y: 20 }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },
  });

  return (
    <Animated.View
      style={[
        styles.cameraComponent,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <CameraDetector ref={ref} onAnalysisComplete={onAnalysisComplete} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cameraComponent: {
    position: 'absolute',
    width: 150,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
});

export default DraggableCamera;
