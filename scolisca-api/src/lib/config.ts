import { DEFAULT_PROMPTS, PromptConfig } from './prompts';

export interface AppConfig {
  r2: {
    accountId: string;
    bucketName: string;
    publicDomain: string;
  };
  ai: {
    provider: 'openai' | 'doubao' | 'zhipu';
    model: string;
    prompts: PromptConfig;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  r2: {
    accountId: '',
    bucketName: '',
    publicDomain: '',
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4o',
    prompts: DEFAULT_PROMPTS,
  },
};

let runtimeConfig: AppConfig = { ...DEFAULT_CONFIG };

export const getConfig = (): AppConfig => runtimeConfig;

export const updateConfig = (updates: Partial<AppConfig>): AppConfig => {
  runtimeConfig = {
    ...runtimeConfig,
    ...updates,
    r2: { ...runtimeConfig.r2, ...(updates.r2 || {}) },
    ai: { ...runtimeConfig.ai, ...(updates.ai || {}) },
  };
  return runtimeConfig;
};

export const resetConfig = (): AppConfig => {
  runtimeConfig = { ...DEFAULT_CONFIG };
  return runtimeConfig;
};

export const getPrompts = (): PromptConfig => runtimeConfig.ai.prompts;

export const getPhotoPrompt = (): string => runtimeConfig.ai.prompts.photo;
export const getXrayPrompt = (): string => runtimeConfig.ai.prompts.xray;

export const getEffectiveR2Config = () => ({
  accountId: runtimeConfig.r2.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || '',
  bucketName: runtimeConfig.r2.bucketName || process.env.R2_BUCKET_NAME || '',
  publicDomain: runtimeConfig.r2.publicDomain || process.env.R2_PUBLIC_DOMAIN || '',
});
