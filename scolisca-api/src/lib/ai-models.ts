export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface AIProviderInfo {
  id: 'openai' | 'doubao' | 'zhipu';
  name: string;
  models: AIModel[];
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: '最新多模态模型，支持视觉' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '轻量版GPT-4o' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '快速准确的GPT-4' },
      { id: 'gpt-4', name: 'GPT-4', description: '强大的通用模型' },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    models: [
      { id: 'glm-4.6v', name: 'GLM-4.6V', description: '智谱最新多模态模型，支持视觉增强理解' },
      { id: 'glm-4v', name: 'GLM-4V', description: '智谱最新视觉模型，支持图像分析' },
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', description: '智谱视觉增强版，更强的视觉理解' },
      { id: 'glm-4.5v', name: 'GLM-4.5V', description: '智谱4.5V视觉模型，平衡性能与速度' },
      { id: 'glm-4-plus', name: 'GLM-4 Plus', description: '高性能对话模型' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', description: '快速响应模型' },
    ]
  },
  {
    id: 'doubao',
    name: '百度豆包',
    models: [
      { id: 'ernie-4.0-8k-latest', name: 'ERNIE 4.0 8K', description: '百度最新旗舰模型' },
      { id: 'ernie-3.5-8k', name: 'ERNIE 3.5 8K', description: '高性能对话模型' },
    ]
  }
];

export const getProviderById = (id: string): AIProviderInfo | undefined => {
  return AI_PROVIDERS.find(p => p.id === id);
};

export const getModelById = (providerId: string, modelId: string): AIModel | undefined => {
  const provider = getProviderById(providerId);
  return provider?.models.find(m => m.id === modelId);
};

export const getDefaultModel = (providerId: string): string => {
  const provider = getProviderById(providerId);
  return provider?.models[0]?.id || '';
};