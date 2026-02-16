import { queryOptions } from "@tanstack/react-query";
import { getBackgroundConfigFn, getSystemConfigFn } from "../config.api";

export const CONFIG_KEYS = {
  all: ["config"] as const,

  // Leaf keys (static arrays - no child queries)
  system: ["config", "system"] as const,
  background: ["config", "background"] as const,
};

export const systemConfigQuery = queryOptions({
  queryKey: CONFIG_KEYS.system,
  queryFn: getSystemConfigFn,
});

export const backgroundConfigQuery = queryOptions({
  queryKey: CONFIG_KEYS.background,
  queryFn: getBackgroundConfigFn,
  staleTime: 5 * 60 * 1000, // 5 minutes — background settings change rarely
});
