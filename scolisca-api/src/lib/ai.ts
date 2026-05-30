import axios, { AxiosError } from 'axios';
import { getConfig, getPhotoPrompt, getXrayPrompt } from './config';

export interface AssessmentItem {
  status: 'normal' | 'abnormal';
  description: string;
}

export interface DetailedAssessment {
  shoulders: AssessmentItem;
  scapula: AssessmentItem;
  neckMidline: AssessmentItem;
  waist: AssessmentItem;
  trunkMidline: AssessmentItem;
  pelvis: AssessmentItem;
}

export interface AnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  shoulderBalance?: string;
  pelvicTilt?: string;
  spineContour?: string;
  cobbAngle: number;
  recommendations: string[];
  summary: string;
  lungHealth?: string;
  lungAffectedDetails?: string;
  lungConfidence?: 'low' | 'medium' | 'high';
  curveLocation?: string;
  curveDirection?: string;
  curveType?: 'C型' | 'S型' | '其他';
  affectedVertebrae?: string;
  vertebralRotation?: string;
  postSurgical?: boolean;
  postSurgicalDetails?: string;
  detailedAssessment?: DetailedAssessment;
  abnormalSigns?: string[];
  scoliosisType?: string;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface CombinedResult extends ValidationResult, AnalysisResult {}

export interface AIProviderConfig {
  provider: 'openai' | 'doubao' | 'zhipu';
  apiKey?: string;
  secretKey?: string;
  model?: string;
}

export type ImageType = 'photo' | 'xray';

function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tr-${timestamp}-${random}`;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

interface LogContext {
  traceId: string;
  url: string;
}

function log(message: string, context: LogContext, data?: any): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${context.url}] [${context.traceId}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

function logError(message: string, context: LogContext, data?: any): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${context.url}] [${context.traceId}]`;
  if (data !== undefined) {
    console.error(prefix, message, data);
  } else {
    console.error(prefix, message);
  }
}

function logWarn(message: string, context: LogContext, data?: any): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${context.url}] [${context.traceId}]`;
  if (data !== undefined) {
    console.warn(prefix, message, data);
  } else {
    console.warn(prefix, message);
  }
}

function getEffectiveProvider(): 'openai' | 'doubao' | 'zhipu' {
  const envProvider = process.env.AI_PROVIDER as 'openai' | 'doubao' | 'zhipu' | undefined;
  if (envProvider && ['openai', 'doubao', 'zhipu'].includes(envProvider)) {
    return envProvider;
  }
  return getConfig().ai.provider;
}

function getModelForProvider(provider: 'openai' | 'doubao' | 'zhipu'): string {
  const config = getConfig();
  if (provider === 'openai') {
    return config.ai.model || 'gpt-4o';
  }
  if (provider === 'zhipu') {
    return 'glm-4.6v';
  }
  return 'ernie-4.0-8k';
}

function getZhipuErrorMessage(error: any): string {
  if (error.response?.data) {
    return JSON.stringify(error.response.data);
  }
  if (error.message) {
    return error.message;
  }
  return 'Unknown error';
}

async function callVisionAI(imageData: string, prompt: string, provider: 'openai' | 'zhipu', context: LogContext): Promise<string> {
  const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API Key not configured');
    }

    const model = getModelForProvider('openai');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: isUrl ? imageData : `data:image/jpeg;base64,${imageData}` },
              },
            ],
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } else {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      throw new Error('Zhipu API Key not configured');
    }

    const model = getModelForProvider('zhipu');

    try {
      const response = await axios.post(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: imageData },
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMsg = getZhipuErrorMessage(error);
        logError('Zhipu API error details:', context, error.response?.data);
        throw new Error(`Zhipu API error: ${errorMsg}`);
      }
      throw error;
    }
  }
}

async function callTextAI(prompt: string): Promise<string> {
  const config = getConfig();
  const provider = config.ai.provider;

  if (provider === 'doubao') {
    const apiKey = process.env.DOUBAO_API_KEY;
    const secretKey = process.env.DOUBAO_SECRET_KEY;

    if (!apiKey || !secretKey) {
      throw new Error('Doubao API credentials not configured');
    }

    const tokenResponse = await axios.post(
      'https://aip.baidubce.com/oauth/2.0/token',
      null,
      {
        params: {
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: secretKey,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const response = await axios.post(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k-latest?access_token=${accessToken}`,
      {
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data.result;
  }

  throw new Error('Text AI only supported for Doubao provider');
}

function parseJSONResponse(content: string): any {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to parse JSON response');
}

export function generateMockResult(imageType: ImageType = 'photo'): AnalysisResult {
  const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];

  let cobbAngle: number;
  if (risk === 'low') cobbAngle = Math.floor(Math.random() * 5) + 1;
  else if (risk === 'medium') cobbAngle = Math.floor(Math.random() * 10) + 10;
  else cobbAngle = Math.floor(Math.random() * 20) + 20;

  if (imageType === 'xray') {
    return {
      riskLevel: risk,
      scoliosisType: ['特发性', '先天性', '神经肌肉性'][Math.floor(Math.random() * 3)],
      postSurgical: Math.random() > 0.7,
      postSurgicalDetails: '',
      cobbAngle,
      curveLocation: ['胸椎', '腰椎', '胸腰段'][Math.floor(Math.random() * 3)],
      curveDirection: ['左侧凸', '右侧凸'][Math.floor(Math.random() * 2)],
      curveType: ['C型', 'S型', '其他'][Math.floor(Math.random() * 3)] as 'C型' | 'S型' | '其他',
      affectedVertebrae: ['T5-T12侧弯', 'L1-L3后凸', 'T10-L2融合', 'T8-L5侧弯'][Math.floor(Math.random() * 4)],
      vertebralRotation: ['无', '轻度', '中度'][Math.floor(Math.random() * 3)],
      recommendations: [
        cobbAngle < 10 ? '定期复查，继续观察' : '建议咨询骨科专家',
        '保持正确的坐姿和站姿',
        '适当进行康复锻炼'
      ],
      summary: `X光片分析结果：${risk === 'low' ? '低风险' : risk === 'medium' ? '中风险，建议关注' : '高风险，建议尽快就医'}`
    };
  }

  const abnormalSignsList = ['双肩高低不对称', '肩胛不对称', '颈部中线偏移', '腰窝不对称', '躯干中线偏移', '骨盆不对称'];
  const randomAbnormalCount = risk === 'low' ? Math.floor(Math.random() * 2) : risk === 'medium' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
  const shuffled = [...abnormalSignsList].sort(() => Math.random() - 0.5);
  const abnormalSigns = shuffled.slice(0, Math.min(randomAbnormalCount, abnormalSignsList.length));

  return {
    riskLevel: risk,
    shoulderBalance: ['左肩略高', '右肩略高', '基本平衡'][Math.floor(Math.random() * 3)],
    pelvicTilt: ['骨盆左倾', '骨盆右倾', '基本水平'][Math.floor(Math.random() * 3)],
    spineContour: ['脊柱轮廓正常', '疑似S形侧弯', '疑似C形侧弯'][Math.floor(Math.random() * 3)],
    cobbAngle,
    detailedAssessment: {
      shoulders: {
        status: abnormalSigns.includes('双肩高低不对称') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('双肩高低不对称') ? '观察到双肩高度不一致，左侧略高于右侧' : '双肩高度基本一致，肩峰对称'
      },
      scapula: {
        status: abnormalSigns.includes('肩胛不对称') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('肩胛不对称') ? '两侧肩胛骨位置不对称，右侧稍显突出' : '两侧肩胛骨大小、位置、突出度对称'
      },
      neckMidline: {
        status: abnormalSigns.includes('颈部中线偏移') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('颈部中线偏移') ? '颈部中线与脊柱中线存在轻微偏移' : '后颈发际线中点、脊柱、臀沟在同一直线上'
      },
      waist: {
        status: abnormalSigns.includes('腰窝不对称') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('腰窝不对称') ? '两侧腰窝深浅不一致，右侧稍深' : '左右腰窝深浅、大小一致，腰部曲线对称'
      },
      trunkMidline: {
        status: abnormalSigns.includes('躯干中线偏移') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('躯干中线偏移') ? '躯干中线偏离臀沟中心，存在轻微弯曲' : '躯干中线穿过脊柱、臀沟正中'
      },
      pelvis: {
        status: abnormalSigns.includes('骨盆不对称') ? 'abnormal' : 'normal',
        description: abnormalSigns.includes('骨盆不对称') ? '两侧臀峰高度不一致，骨盆轻微倾斜' : '两侧臀峰等高，臀沟垂直居中'
      }
    },
    abnormalSigns,
    recommendations: [
      cobbAngle < 10 ? '姿态良好，继续保持' : '建议进行专业检查',
      '保持正确的坐姿和站姿',
      '适当进行背部肌肉锻炼'
    ],
    summary: `评估结果：${risk === 'low' ? '低风险' : risk === 'medium' ? '中风险，建议关注' : '高风险，建议尽快就医'}。检测到${abnormalSigns.length}项异常体征：${abnormalSigns.join('、')}。建议保持良好姿态，定期观察，如有不适请及时就医。`
  };
}

export async function analyzeImage(
  imageData: string,
  options?: {
    provider?: 'openai' | 'doubao' | 'zhipu';
    imageType?: ImageType;
    url?: string;
  }
): Promise<{
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  validation?: ValidationResult;
  traceId?: string;
}> {
  const provider = options?.provider || getEffectiveProvider();
  const imageType = options?.imageType || 'photo';
  const url = options?.url || '/api/analyze';
  const traceId = generateTraceId();
  const context: LogContext = { traceId, url };

  const prompt = imageType === 'photo'
      ? getPhotoPrompt()
      : getXrayPrompt();

  try {
    let content: string;

    if (provider === 'doubao') {
      logWarn('Doubao does not support vision analysis, returning mock result', context);
      const mockResult = generateMockResult(imageType);
      return {
        success: true,
        data: mockResult,
        validation: { isValid: true },
        traceId
      };
    } else {
      content = await callVisionAI(imageData, prompt, provider, context);
    }

    const parsedResult = parseJSONResponse(content) as CombinedResult;

    if (!parsedResult.isValid) {
      return {
        success: false,
        error: parsedResult.reason || '图片验证失败',
        validation: {
          isValid: false,
          reason: parsedResult.reason
        },
        traceId
      };
    }

    const analysisResult: AnalysisResult = {
      riskLevel: parsedResult.riskLevel,
      cobbAngle: parsedResult.cobbAngle,
      recommendations: parsedResult.recommendations,
      summary: parsedResult.summary,
      lungHealth: parsedResult.lungHealth,
      lungAffectedDetails: parsedResult.lungAffectedDetails,
      lungConfidence: parsedResult.lungConfidence,
      curveLocation: parsedResult.curveLocation,
      curveDirection: parsedResult.curveDirection,
      curveType: parsedResult.curveType,
      affectedVertebrae: parsedResult.affectedVertebrae,
      vertebralRotation: parsedResult.vertebralRotation,
      postSurgical: parsedResult.postSurgical,
      postSurgicalDetails: parsedResult.postSurgicalDetails,
      shoulderBalance: parsedResult.shoulderBalance,
      pelvicTilt: parsedResult.pelvicTilt,
      spineContour: parsedResult.spineContour,
      detailedAssessment: parsedResult.detailedAssessment,
      abnormalSigns: parsedResult.abnormalSigns,
    };

    return {
      success: true,
      data: analysisResult,
      validation: {
        isValid: true,
        reason: parsedResult.reason
      },
      traceId
    };
  } catch (error) {
    logError('Analysis error:', context, error instanceof Error ? error.message : '分析失败');
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析失败',
      traceId
    };
  }
}