import { useWindowDimensions } from "react-native";
import { Robot, UsersThree, Globe } from "phosphor-react-native";

type ModeCharacterProps = {
  type: "ai" | "human" | "online";
};

export default function ModeCharacter({ type }: ModeCharacterProps) {
  const { width } = useWindowDimensions();
  const iconSize = width < 360 ? 32 : 38;

  if (type === "ai") {
    return <Robot size={iconSize} weight="duotone" color="#22d3ee" />;
  }

  if (type === "human") {
    return <UsersThree size={iconSize} weight="duotone" color="#22d3ee" />;
  }

  return <Globe size={iconSize} weight="duotone" color="#22d3ee" />;
}
