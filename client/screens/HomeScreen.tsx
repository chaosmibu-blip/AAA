import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

import { FloatingBall } from "@/components/FloatingBall";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const instructionOpacity = useSharedValue(1);

  useEffect(() => {
    instructionOpacity.value = withDelay(3000, withTiming(0, { duration: 1000 }));

    const timer = setTimeout(() => {
      setHasInteracted(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const instructionStyle = useAnimatedStyle(() => ({
    opacity: instructionOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {!hasInteracted ? (
        <Animated.View style={[styles.instructionContainer, instructionStyle]}>
          <ThemedText style={styles.instruction}>拖動我</ThemedText>
        </Animated.View>
      ) : null}
      <FloatingBall />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  instructionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
