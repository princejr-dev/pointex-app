import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, Modal, Text, View } from "react-native";

type GameModalProps = {
  visible: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  animated?: boolean;
};

export default function GameModal({
  visible,
  title,
  children,
  onClose,
  animated = false,
}: GameModalProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      contentOpacity.setValue(0);
      contentScale.setValue(0.82);
      return;
    }

    if (!animated) {
      backdropOpacity.setValue(1);
      contentOpacity.setValue(1);
      contentScale.setValue(1);
      return;
    }

    backdropOpacity.setValue(0);
    contentOpacity.setValue(0);
    contentScale.setValue(0.82);

    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [visible, animated, backdropOpacity, contentOpacity, contentScale]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animated ? "none" : "fade"}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(2, 6, 23, 0.82)",
            opacity: animated ? backdropOpacity : 1,
          }}
        />

        <Animated.View
          style={{
            width: "100%",
            maxWidth: 420,
            maxHeight: "85%",
            overflow: "hidden",
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(34, 211, 238, 0.35)",
            backgroundColor: "#0e1633",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 10,
            opacity: animated ? contentOpacity : 1,
            transform: [
              {
                scale: animated ? contentScale : 1,
              },
            ],
          }}
        >
          {title && (
            <View
              style={{
                minHeight: 64,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                borderBottomWidth: 1,
                borderBottomColor: "rgba(51, 65, 85, 0.7)",
              }}
            >
              <Text
                style={{
                  fontFamily: "RussoOne",
                  fontSize: 20,
                  color: "#0ea5e9",
                  textTransform: "uppercase",
                }}
              >
                {title}
              </Text>
            </View>
          )}

          <View style={{ padding: 20 }}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}
