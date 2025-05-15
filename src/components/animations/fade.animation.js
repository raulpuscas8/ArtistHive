// src/components/animations/fade.animation.js
import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";

export const FadeInView = ({ duration = 200, style, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  return (
    <Animated.View
      style={[
        { opacity },
        style, // preserve any parent‐passed styles
      ]}
    >
      {children}
    </Animated.View>
  );
};
