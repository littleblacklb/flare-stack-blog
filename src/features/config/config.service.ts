import type { BackgroundConfig, SystemConfig } from "@/features/config/config.schema";
import * as CacheService from "@/features/cache/cache.service";
import * as ConfigRepo from "@/features/config/config.data";
import {
  CONFIG_CACHE_KEYS,
  DEFAULT_BACKGROUND_CONFIG,
  SystemConfigSchema,
} from "@/features/config/config.schema";

export async function getSystemConfig(
  context: DbContext & { executionCtx: ExecutionContext },
) {
  return await CacheService.get(
    context,
    CONFIG_CACHE_KEYS.system,
    SystemConfigSchema.nullable(),
    async () => await ConfigRepo.getSystemConfig(context.db),
  );
}

export async function getBackgroundConfig(
  context: DbContext & { executionCtx: ExecutionContext },
): Promise<BackgroundConfig> {
  const config = await getSystemConfig(context);
  return { ...DEFAULT_BACKGROUND_CONFIG, ...config?.background };
}

export async function updateSystemConfig(
  context: DbContext,
  data: SystemConfig,
) {
  await ConfigRepo.upsertSystemConfig(context.db, data);
  await CacheService.deleteKey(
    context,
    CONFIG_CACHE_KEYS.system,
    CONFIG_CACHE_KEYS.isEmailConfigured,
  );

  return { success: true };
}

