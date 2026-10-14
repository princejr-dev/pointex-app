import { useWindowDimensions, View } from "react-native";
import {
  Canvas,
  Fill,
  LinearGradient,
  Rect,
  Shader,
  Skia,
  useClock,
  vec,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

const fabricEffect = Skia.RuntimeEffect.Make(`

uniform float2 iResolution;
uniform float iTime;

half4 main(float2 pos) {
  float2 uv = pos / iResolution;
  float t = iTime * 0.20;

  // Plis verticaux souples
  float fold = sin(uv.y * 5.0 - t) * 9.0
             + sin(uv.y * 10.0 + t * 0.6) * 3.0;

  float fold2 = sin(uv.y * 3.0 - t * 0.7) * 5.0;

  // La grille se déforme comme un tissu
  float x = pos.x + fold + fold2;

  // La grille descend progressivement
  float y = pos.y - t * 12.0
          + sin(uv.x * 5.0 - t * 0.8) * 4.0
          + sin(uv.x * 9.0 + uv.y * 3.0 - t) * 1.5;

  // Grille régulière, légèrement ondulée
  float spacing = 54.0;
  float gx = abs(fract(x / spacing) - 0.5);
  float gy = abs(fract(y / spacing) - 0.5);

  float lineX = 1.0 - smoothstep(0.012, 0.045, gx);
  float lineY = 1.0 - smoothstep(0.012, 0.045, gy);

  float grid = max(lineX, lineY);

  // Reflets discrets sur les plis
  float folds = sin(x * 0.035 + sin(uv.y * 4.0 - t));
  float highlight = pow(max(folds, 0.0), 5.0);

  float3 base = float3(0.025, 0.040, 0.075);
  float3 gridColor = float3(0.08, 0.28, 0.42);
  float3 cyan = float3(0.02, 0.48, 0.65);

  float3 color = base;
  color += gridColor * grid * 0.20;
  color += cyan * grid * highlight * 0.22;

  // Lumière diffuse en haut
  float topGlow = 1.0 - smoothstep(0.0, 0.75, uv.y);
  color += cyan * topGlow * 0.035;

  // Bords légèrement assombris
  float edge = smoothstep(0.0, 0.15, uv.x)
             * (1.0 - smoothstep(0.85, 1.0, uv.x));

  color *= 0.72 + edge * 0.28;

  return half4(color, 1.0);
}
`);

export default function AnimatedFabricBackground() {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    iResolution: [width, height],
    iTime: clock.value / 1000,
  }));

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: "hidden",
        backgroundColor: "#080d1b",
      }}
    >
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={["#17243c", "#0b1429", "#070b16"]}
          />
        </Rect>

        {fabricEffect && (
          <Fill>
            <Shader source={fabricEffect} uniforms={uniforms} />
          </Fill>
        )}
      </Canvas>
    </View>
  );
}
