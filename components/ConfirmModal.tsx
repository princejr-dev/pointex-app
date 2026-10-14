import { Text, View } from "react-native";
import { X } from "phosphor-react-native";

import GameButton from "./GameButton";
import GameModal from "./GameModal";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <GameModal visible={visible} onClose={onCancel}>
      <View>
        <Text
          style={{
            fontFamily: "RussoOne",
            fontSize: 20,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            marginTop: 12,
            fontFamily: "RussoOne",
            fontSize: 14,
            lineHeight: 21,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          {message}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
            width: "100%",
          }}
        >
          <GameButton
            nameId={cancelLabel}
            colors={["#3B82F6", "#1D4ED8"]}
            borderColor="rgba(59, 130, 246, 0.4)"
            onPress={onCancel}
          />

          <GameButton
            nameId={confirmLabel}
            colors={["#ef4444", "#0b1220"]}
            borderColor="rgba(239, 68, 68, 0.4)"
            onPress={onConfirm}
          />
        </View>
      </View>
    </GameModal>
  );
}
