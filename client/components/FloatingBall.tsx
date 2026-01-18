import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BALL_SIZE = 60;
const EDGE_MARGIN = 16;
const TAP_THRESHOLD = 10; // 移動距離小於此值視為點擊

const springConfig = {
  damping: 20,
  stiffness: 200,
  mass: 1,
};

interface FloatingBallProps {
  onPress?: () => void;
}

export function FloatingBall({ onPress }: FloatingBallProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const minX = EDGE_MARGIN;
  const maxX = screenWidth - BALL_SIZE - EDGE_MARGIN;
  const minY = insets.top + EDGE_MARGIN;
  const maxY = screenHeight - BALL_SIZE - insets.bottom - EDGE_MARGIN;

  const translateX = useSharedValue(maxX);
  const translateY = useSharedValue(screenHeight / 2 - BALL_SIZE / 2);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.85);

  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);
  const totalTranslation = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const snapToEdge = () => {
    "worklet";
    const currentX = translateX.value;
    const centerX = screenWidth / 2;

    if (currentX + BALL_SIZE / 2 < centerX) {
      translateX.value = withSpring(minX, springConfig);
    } else {
      translateX.value = withSpring(maxX, springConfig);
    }
  };

  const clampPosition = () => {
    "worklet";
    if (translateX.value < minX) {
      translateX.value = minX;
    } else if (translateX.value > maxX) {
      translateX.value = maxX;
    }

    if (translateY.value < minY) {
      translateY.value = minY;
    } else if (translateY.value > maxY) {
      translateY.value = maxY;
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
      totalTranslation.value = 0;
      scale.value = withSpring(1.1, springConfig);
      opacity.value = withSpring(1, springConfig);
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      translateX.value = contextX.value + event.translationX;
      translateY.value = contextY.value + event.translationY;
      totalTranslation.value =
        Math.abs(event.translationX) + Math.abs(event.translationY);
      clampPosition();
    })
    .onEnd(() => {
      scale.value = withSpring(1, springConfig);
      opacity.value = withSpring(0.85, springConfig);

      // 如果移動距離很小，視為點擊
      if (totalTranslation.value < TAP_THRESHOLD) {
        runOnJS(handleTap)();
      } else {
        snapToEdge();
        translateY.value = withSpring(
          Math.max(minY, Math.min(maxY, translateY.value)),
          springConfig,
        );
        runOnJS(triggerHaptic)();
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleTap)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.ball, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: "#6B7280",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
