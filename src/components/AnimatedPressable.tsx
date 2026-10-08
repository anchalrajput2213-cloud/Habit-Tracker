import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        style,
        pressed && {
          opacity: 0.5,
        },
      ]}
    >
      {children}
    </Pressable>
  );
};