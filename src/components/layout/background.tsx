import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { backgroundConfigQuery } from "@/features/config/queries";
import { DEFAULT_BACKGROUND_CONFIG } from "@/features/config/config.schema";

export function Background() {
  const { data: config } = useQuery(backgroundConfigQuery);

  const enabled = config?.enabled ?? DEFAULT_BACKGROUND_CONFIG.enabled;
  const globalUrl = config?.imageUrl ?? DEFAULT_BACKGROUND_CONFIG.imageUrl;
  const homeUrl = config?.homeImageUrl ?? DEFAULT_BACKGROUND_CONFIG.homeImageUrl;
  const opacity = config?.opacity ?? DEFAULT_BACKGROUND_CONFIG.opacity!;
  const darkOpacity = config?.darkOpacity ?? DEFAULT_BACKGROUND_CONFIG.darkOpacity!;
  const blur = config?.blur ?? DEFAULT_BACKGROUND_CONFIG.blur!;
  const overlayOpacity =
    config?.overlayOpacity ?? DEFAULT_BACKGROUND_CONFIG.overlayOpacity!;
  const transitionDuration =
    config?.transitionDuration ?? DEFAULT_BACKGROUND_CONFIG.transitionDuration!;

  // Detect if we're on the homepage
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHomepage = pathname === "/" || pathname === "";

  // Scroll-based crossfade ratio (0 = full home image, 1 = full global image)
  const [scrollRatio, setScrollRatio] = useState(0);

  // --- Route transition state ---
  // Keep the home layer mounted during exit transition so it can fade out
  const prevIsHomepageRef = useRef(isHomepage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Animated blend factor: 0 = full home, 1 = full global
  const [transitionBlend, setTransitionBlend] = useState(isHomepage ? 0 : 1);

  useEffect(() => {
    const wasHomepage = prevIsHomepageRef.current;
    prevIsHomepageRef.current = isHomepage;

    if (wasHomepage === isHomepage) return;

    // Route changed — start a crossfade
    setIsTransitioning(true);

    // On arriving at homepage, reset scroll ratio so we start from the home image
    if (isHomepage) {
      setScrollRatio(0);
    }

    // Kick off the transition on the next frame so the CSS transition fires
    requestAnimationFrame(() => {
      setTransitionBlend(isHomepage ? 0 : 1);
    });

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);

    return () => clearTimeout(timer);
  }, [isHomepage, transitionDuration]);

  const handleScroll = useCallback(() => {
    const vh = window.innerHeight;
    const ratio = Math.min(window.scrollY / vh, 1);
    setScrollRatio(ratio);
  }, []);

  useEffect(() => {
    if (!isHomepage || !homeUrl) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Set initial value
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage, homeUrl, handleScroll]);

  if (!enabled || (!globalUrl && !homeUrl)) return null;

  // Show the home layer if we're on the homepage OR still transitioning away
  const showHomeLayer = (isHomepage || isTransitioning) && !!homeUrl;
  const showGlobalLayer = !!globalUrl;

  // Compute effective opacities
  let homeLayerOpacity: number;
  let globalLayerOpacity: number;

  if (isHomepage && !isTransitioning) {
    // Normal homepage scroll crossfade
    homeLayerOpacity = 1 - scrollRatio;
    globalLayerOpacity = showGlobalLayer ? scrollRatio : 0;
  } else if (isTransitioning) {
    // During route transition, blend between home & global using CSS-transitioned value
    homeLayerOpacity = 1 - transitionBlend;
    globalLayerOpacity = showGlobalLayer ? transitionBlend : 0;
  } else {
    // Not homepage, transition done — full global
    homeLayerOpacity = 0;
    globalLayerOpacity = 1;
  }

  const transitionStyle = isTransitioning
    ? `opacity ${transitionDuration}ms ease`
    : "none";

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden">
      {/* Home image layer */}
      {showHomeLayer && (
        <>
          {/* Light mode */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
            style={{
              backgroundImage: `url('${homeUrl}')`,
              opacity: homeLayerOpacity * (opacity / 100),
              transition: transitionStyle,
            }}
          />
          {/* Dark mode */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block"
            style={{
              backgroundImage: `url('${homeUrl}')`,
              opacity: homeLayerOpacity * (darkOpacity / 100),
              transition: transitionStyle,
            }}
          />
        </>
      )}

      {/* Global image layer */}
      {showGlobalLayer && (
        <>
          {/* Light mode */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
            style={{
              backgroundImage: `url('${globalUrl}')`,
              opacity: globalLayerOpacity * (opacity / 100),
              transition: transitionStyle,
            }}
          />
          {/* Dark mode */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block"
            style={{
              backgroundImage: `url('${globalUrl}')`,
              opacity: globalLayerOpacity * (darkOpacity / 100),
              transition: transitionStyle,
            }}
          />
        </>
      )}

      {/* Gradient overlay for edge blending */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, hsl(var(--background) / ${overlayOpacity * 0.9 / 100}), hsl(var(--background) / ${overlayOpacity * 0.5 / 100}), hsl(var(--background) / ${overlayOpacity * 0.9 / 100}))`,
        }}
      />

      {/* Blur + base color overlay */}
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
