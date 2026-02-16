import { useQuery } from "@tanstack/react-query";
import { backgroundConfigQuery } from "@/features/config/queries";
import { DEFAULT_BACKGROUND_CONFIG } from "@/features/config/config.schema";

export function Background() {
  const { data: config } = useQuery(backgroundConfigQuery);

  const enabled = config?.enabled ?? DEFAULT_BACKGROUND_CONFIG.enabled;
  const imageUrl = config?.imageUrl ?? DEFAULT_BACKGROUND_CONFIG.imageUrl;
  const opacity = config?.opacity ?? DEFAULT_BACKGROUND_CONFIG.opacity!;
  const darkOpacity = config?.darkOpacity ?? DEFAULT_BACKGROUND_CONFIG.darkOpacity!;
  const blur = config?.blur ?? DEFAULT_BACKGROUND_CONFIG.blur!;
  const overlayOpacity =
    config?.overlayOpacity ?? DEFAULT_BACKGROUND_CONFIG.overlayOpacity!;

  if (!enabled || !imageUrl) return null;

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden">
      {/* Light mode image layer — hidden in dark mode */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 dark:hidden"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          opacity: opacity / 100,
        }}
      />

      {/* Dark mode image layer — hidden in light mode */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 hidden dark:block"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          opacity: darkOpacity / 100,
        }}
      />

      {/* Gradient overlay for edge blending — scales with overlayOpacity */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, hsl(var(--background) / ${overlayOpacity * 0.9 / 100}), hsl(var(--background) / ${overlayOpacity * 0.5 / 100}), hsl(var(--background) / ${overlayOpacity * 0.9 / 100}))`,
        }}
      />

      {/* Blur + base color — scales with overlayOpacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `hsl(var(--background) / ${overlayOpacity / 100})`,
          backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </div>
  );
}
