# API 服務封裝層範例

本文件提供所有 API 服務的封裝層程式碼範例，這些服務位於 `src/main/services/`。

## 目錄

1. [TTSService - Google Text-to-Speech](#ttsservice)
2. [GeminiService - Google Gemini API](#geminiservice)
3. [ReplicateService - Replicate FLUX API](#replicateservice)
4. [DIDService - D-ID API](#didservice)
5. [FFmpegService - FFmpeg 封裝](#ffmpegservice)
6. [YouTubeService - YouTube Data API](#youtubeservice)
7. [KeychainService - macOS Keychain](#keychainservice)

---

## TTSService

### 檔案位置
`src/main/services/TTSService.ts`

### 程式碼

```typescript
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { KeychainService } from './KeychainService';

interface TTSRequest {
  text: string;
  voiceId: string;
  outputPath: string;
}

interface TTSResponse {
  audioPath: string;
  timecodes: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  languageCode: string;
}

export class TTSService {
  private static readonly API_BASE_URL = 'https://texttospeech.googleapis.com/v1';

  /**
   * 生成語音音檔和時間標記
   */
  static async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    const apiKey = await KeychainService.getAPIKey('google-tts');
    if (!apiKey) {
      throw new Error('Google TTS API 金鑰未設定');
    }

    // 將文字轉換為 SSML 格式，插入時間標記
    const ssml = this.textToSSML(request.text);

    // 呼叫 Google TTS API
    const response = await axios.post(
      `${this.API_BASE_URL}/text:synthesize`,
      {
        input: { ssml },
        voice: {
          languageCode: 'zh-TW',
          name: request.voiceId,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
        enableTimePointing: ['TIMEPOINT_TYPE_SSML_MARK'],
      },
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    // 解碼 Base64 音檔並儲存
    const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
    await fs.writeFile(request.outputPath, audioBuffer);

    // 解析時間標記
    const timecodes = this.parseTimecodes(
      request.text,
      response.data.timepoints || []
    );

    return {
      audioPath: request.outputPath,
      timecodes,
    };
  }

  /**
   * 取得可用語音列表
   */
  static async listVoices(languageCode: string = 'zh-TW'): Promise<Voice[]> {
    const apiKey = await KeychainService.getAPIKey('google-tts');
    if (!apiKey) {
      throw new Error('Google TTS API 金鑰未設定');
    }

    const response = await axios.get(
      `${this.API_BASE_URL}/voices`,
      {
        headers: { 'X-Goog-Api-Key': apiKey },
        params: { languageCode },
      }
    );

    return response.data.voices.map((voice: any) => ({
      id: voice.name,
      name: voice.name,
      gender: voice.ssmlGender,
      languageCode: voice.languageCodes[0],
    }));
  }

  /**
   * 將文字轉換為 SSML 格式
   * 在每個句子後插入標記以獲取時間資訊
   */
  private static textToSSML(text: string): string {
    // 按句子分割（使用句號、問號、驚嘆號）
    const sentences = text.split(/([。！？])/g);

    let ssml = '<speak>';
    let sentenceIndex = 0;

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';

      if (sentence.trim()) {
        ssml += `${sentence}${punctuation}<mark name="sentence_${sentenceIndex}"/>`;
        sentenceIndex++;
      }
    }

    ssml += '</speak>';
    return ssml;
  }

  /**
   * 解析時間標記，將其對應到文字句子
   */
  private static parseTimecodes(
    text: string,
    timepoints: Array<{ markName: string; timeSeconds: number }>
  ): Array<{ text: string; startTime: number; endTime: number }> {
    const sentences = text.split(/[。！？]/g).filter(s => s.trim());
    const timecodes: Array<{ text: string; startTime: number; endTime: number }> = [];

    for (let i = 0; i < sentences.length; i++) {
      const startTime = timepoints[i]?.timeSeconds || 0;
      const endTime = timepoints[i + 1]?.timeSeconds || startTime + 3; // 預設 3 秒

      timecodes.push({
        text: sentences[i].trim(),
        startTime,
        endTime,
      });
    }

    return timecodes;
  }
}
```

---

## GeminiService

### 檔案位置
`src/main/services/GeminiService.ts`

### 程式碼

```typescript
import axios from 'axios';
import { KeychainService } from './KeychainService';

interface ScriptParagraph {
  paragraphId: string;
  text: string;
  startTime: number;
  endTime: number;
  imagePrompt: string;
  imagePromptZh: string;
}

interface GenerateScriptRequest {
  scriptContent: string;
  timecodes: Array<{ text: string; startTime: number; endTime: number }>;
  systemPrompt?: string;
}

interface GenerateScriptResponse {
  paragraphs: ScriptParagraph[];
  usageMetadata: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class GeminiService {
  private static readonly API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
  private static readonly MODEL = 'gemini-pro';

  /**
   * 根據文稿和時間標記生成結構化腳本
   */
  static async generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResponse> {
    const apiKey = await KeychainService.getAPIKey('gemini');
    if (!apiKey) {
      throw new Error('Gemini API 金鑰未設定');
    }

    // 使用預設或自訂 system prompt
    const systemPrompt = request.systemPrompt || this.getDefaultSystemPrompt();

    // 構建請求內容
    const userPrompt = this.buildUserPrompt(request.scriptContent, request.timecodes);

    // 呼叫 Gemini API
    const response = await axios.post(
      `${this.API_BASE_URL}/models/${this.MODEL}:generateContent`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // 解析回應
    const candidate = response.data.candidates[0];
    const generatedText = candidate.content.parts[0].text;

    // 解析 JSON 回應
    const scriptData = JSON.parse(this.extractJSON(generatedText));

    // 將時間標記對應到段落
    const paragraphs = this.mapTimecodes(scriptData.paragraphs, request.timecodes);

    return {
      paragraphs,
      usageMetadata: {
        inputTokens: response.data.usageMetadata.promptTokenCount,
        outputTokens: response.data.usageMetadata.candidatesTokenCount,
      },
    };
  }

  /**
   * 取得預設的 system prompt
   */
  private static getDefaultSystemPrompt(): string {
    return `你是一個專業的 YouTube 影片腳本生成助手，專門為影片製作者優化內容結構和視覺呈現。

# 你的任務

根據使用者提供的文稿（可能是演講稿、文章、或腳本大綱），生成適合影片製作的結構化腳本。每個段落都需要配對一張視覺圖片。

# 腳本結構要求

1. **段落數量**：
   - 根據文稿時長和內容複雜度，分成 3-10 個段落
   - 短文稿（< 1 分鐘）：3-4 個段落
   - 中等文稿（1-3 分鐘）：5-7 個段落
   - 長文稿（> 3 分鐘）：8-10 個段落

2. **段落長度**：
   - 每個段落 2-4 句話（20-40 字）
   - 避免段落過長，保持觀眾專注度
   - 每個段落應該表達一個完整的概念或觀點

3. **段落劃分原則**：
   - 按照邏輯結構劃分（引言、論點、結論等）
   - 當話題轉換時，開始新段落
   - 當需要展示不同視覺內容時，開始新段落
   - 確保段落之間的過渡自然流暢

# 圖片提示詞 (Image Prompt) 要求

為每個段落生成高品質的圖片提示詞，用於 AI 圖片生成（FLUX 模型）。

## 提示詞撰寫原則

1. **使用英文**：所有提示詞必須用英文撰寫（imagePrompt 欄位）
2. **具體且清晰**：描述具體的場景、物體、人物、動作
3. **視覺化優先**：選擇容易視覺化的概念，避免抽象概念
4. **適合靜態圖片**：描述一個靜止的畫面，而非動作過程
5. **16:9 橫向構圖**：考慮橫向畫面的構圖

## 提示詞結構

每個提示詞應包含以下元素：

```
[主體] + [動作/狀態] + [環境/背景] + [氛圍/光線] + [視角/構圖]
```

**範例**：
- ✅ "A young woman working on laptop in a modern bright office, natural sunlight through large windows, plants on desk, warm and productive atmosphere, medium shot"
- ❌ "辦公室" (太簡短)
- ❌ "Success and productivity" (太抽象)

## 提示詞範例（依主題分類）

**人物場景**：
- "A professional business person presenting ideas to a team in a conference room, whiteboard with diagrams, bright lighting, wide angle shot"
- "A teacher explaining concepts to students in a classroom, chalkboard with notes, warm afternoon light, front view"

**自然風景**：
- "Sunrise over mountain peaks, golden hour light, misty valleys below, dramatic clouds, wide landscape view"
- "Peaceful forest path with sunlight filtering through trees, green foliage, morning dew, serene atmosphere"

**科技/商業**：
- "Modern data center with servers and blue LED lights, high-tech atmosphere, clean and organized, futuristic look"
- "Startup office with creative workspace, colorful furniture, people collaborating, energetic vibe, bright natural light"

**抽象概念視覺化**：
- "成長" → "A small plant sprouting from soil, morning sunlight, water droplets, symbol of growth and new beginnings"
- "連結" → "Interconnected network of glowing nodes and lines, dark background, technology concept, digital visualization"

## 中文提示詞（供參考）

同時提供中文版本的圖片提示詞（imagePromptZh 欄位），方便使用者理解和修改。中文版本應簡潔清晰。

**範例**：
- imagePrompt: "A young woman working on laptop..."
- imagePromptZh: "年輕女性在明亮的現代辦公室使用筆電工作"

# 輸出格式

必須以 JSON 格式回應，嚴格遵守以下結構：

\`\`\`json
{
  "paragraphs": [
    {
      "text": "第一個段落的文字內容，保持原文稿的語氣和用詞。",
      "imagePrompt": "Detailed English image prompt for AI generation, describing a specific visual scene that matches this paragraph content",
      "imagePromptZh": "簡潔的中文圖片提示詞描述"
    },
    {
      "text": "第二個段落的文字內容...",
      "imagePrompt": "Another detailed English image prompt...",
      "imagePromptZh": "另一個中文圖片描述"
    }
  ]
}
\`\`\`

# 重要注意事項

1. **保持原文內容**：段落 text 應該來自原文稿，只做必要的句子重組和分段
2. **避免重複視覺**：確保每個段落的圖片提示詞視覺上有差異，不要重複相似場景
3. **符合文稿主題**：圖片提示詞必須與段落內容相關，不要生成無關的視覺內容
4. **適合所有年齡**：避免生成暴力、色情、或令人不適的視覺內容
5. **文化適當性**：考慮繁體中文使用者的文化背景，避免文化衝突的視覺元素

# 範例輸出

**輸入文稿**：
"人工智慧正在改變我們的生活。從醫療診斷到自動駕駛，AI 技術無處不在。然而，我們也需要思考 AI 帶來的倫理問題。"

**輸出**：
\`\`\`json
{
  "paragraphs": [
    {
      "text": "人工智慧正在改變我們的生活。",
      "imagePrompt": "Futuristic cityscape with AI technology integration, holographic displays, smart devices, clean modern architecture, blue and white color scheme, wide angle view",
      "imagePromptZh": "未來城市景觀，整合 AI 技術，全息顯示器"
    },
    {
      "text": "從醫療診斷到自動駕駛，AI 技術無處不在。",
      "imagePrompt": "Split screen showing AI applications: medical imaging with doctor analyzing brain scan on left, autonomous vehicle on futuristic road on right, high-tech atmosphere",
      "imagePromptZh": "分割畫面展示 AI 應用：醫療影像診斷與自動駕駛"
    },
    {
      "text": "然而，我們也需要思考 AI 帶來的倫理問題。",
      "imagePrompt": "Thoughtful person sitting at desk with books and laptop, contemplating ethical questions, warm study room lighting, philosophical atmosphere, medium shot",
      "imagePromptZh": "深思的人在書桌前思考倫理問題，溫暖的書房氛圍"
    }
  ]
}
\`\`\`

現在，請根據使用者提供的文稿生成結構化腳本。`;
  }

  /**
   * 構建使用者提示
   */
  private static buildUserPrompt(scriptContent: string, timecodes: any[]): string {
    return `請根據以下文稿生成影片腳本：

文稿內容：
${scriptContent}

文稿預計時長：約 ${timecodes[timecodes.length - 1]?.endTime || 0} 秒

請生成結構化的腳本（JSON 格式）。`;
  }

  /**
   * 從 Gemini 回應中提取 JSON（可能包含 Markdown 代碼塊）
   */
  private static extractJSON(text: string): string {
    // 移除 Markdown 代碼塊標記
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }

  /**
   * 將時間標記對應到段落
   */
  private static mapTimecodes(
    paragraphs: any[],
    timecodes: Array<{ text: string; startTime: number; endTime: number }>
  ): ScriptParagraph[] {
    const totalDuration = timecodes[timecodes.length - 1]?.endTime || 0;
    const durationPerParagraph = totalDuration / paragraphs.length;

    return paragraphs.map((p, index) => ({
      paragraphId: `para-${String(index + 1).padStart(3, '0')}`,
      text: p.text,
      startTime: index * durationPerParagraph,
      endTime: (index + 1) * durationPerParagraph,
      imagePrompt: p.imagePrompt,
      imagePromptZh: p.imagePromptZh,
    }));
  }
}
```

---

## ReplicateService

### 檔案位置
`src/main/services/ReplicateService.ts`

### 程式碼

```typescript
import axios from 'axios';
import fs from 'fs/promises';
import crypto from 'crypto';
import { KeychainService } from './KeychainService';
import { retry } from '../utils/retry';
import { ConcurrentQueue } from '../utils/concurrentQueue';

interface GenerateImageRequest {
  prompt: string;
  style: 'realistic' | 'cute-illustration' | 'chinese-classic' | 'children';
  outputPath: string;
  cacheHash?: string;
}

interface GenerateImageResponse {
  imagePath: string;
  fromCache: boolean;
}

export class ReplicateService {
  private static readonly API_BASE_URL = 'https://api.replicate.com/v1';
  private static readonly MODEL = 'black-forest-labs/flux-schnell';
  private static readonly CACHE_DIR = '~/Library/Caches/YTMaker3/images';

  /**
   * 生成單張圖片
   */
  static async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    // 檢查快取
    if (request.cacheHash) {
      const cachedImage = await this.checkCache(request.cacheHash);
      if (cachedImage) {
        return { imagePath: cachedImage, fromCache: true };
      }
    }

    const apiKey = await KeychainService.getAPIKey('replicate');
    if (!apiKey) {
      throw new Error('Replicate API 金鑰未設定');
    }

    // 構建完整提示詞（加入風格）
    const fullPrompt = this.buildPrompt(request.prompt, request.style);

    // 呼叫 Replicate API（帶重試）
    const imageUrl = await retry(
      () => this.callReplicateAPI(fullPrompt, apiKey),
      {
        retries: 3,
        delay: 2000,
      }
    );

    // 下載圖片
    const imageBuffer = await this.downloadImage(imageUrl);

    // 儲存圖片
    await fs.writeFile(request.outputPath, imageBuffer);

    // 儲存快取（若提供 hash）
    if (request.cacheHash) {
      await this.saveCache(request.cacheHash, imageBuffer);
    }

    return {
      imagePath: request.outputPath,
      fromCache: false,
    };
  }

  /**
   * 批次生成圖片（並發控制）
   */
  static async batchGenerate(
    requests: GenerateImageRequest[],
    concurrency: number = 3
  ): Promise<GenerateImageResponse[]> {
    const queue = new ConcurrentQueue(concurrency);

    const tasks = requests.map(request =>
      queue.add(() => this.generateImage(request))
    );

    return Promise.all(tasks);
  }

  /**
   * 構建完整提示詞（加入風格參數）
   */
  private static buildPrompt(basePrompt: string, style: string): string {
    const styleMap = {
      'realistic': 'realistic style, photorealistic, high quality, 16:9',
      'cute-illustration': 'cute illustration style, kawaii, colorful, high quality, 16:9',
      'chinese-classic': 'traditional chinese painting style, ink wash, elegant, 16:9',
      'children': 'children\'s book illustration style, bright colors, simple shapes, 16:9',
    };

    return `${basePrompt}, ${styleMap[style]}`;
  }

  /**
   * 呼叫 Replicate API
   */
  private static async callReplicateAPI(prompt: string, apiKey: string): Promise<string> {
    // 1. 建立預測
    const predictionResponse = await axios.post(
      `${this.API_BASE_URL}/predictions`,
      {
        version: this.MODEL,
        input: { prompt },
      },
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const predictionId = predictionResponse.data.id;

    // 2. 輪詢預測狀態
    let prediction;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒

      const statusResponse = await axios.get(
        `${this.API_BASE_URL}/predictions/${predictionId}`,
        {
          headers: { 'Authorization': `Token ${apiKey}` },
        }
      );

      prediction = statusResponse.data;
    } while (prediction.status === 'starting' || prediction.status === 'processing');

    if (prediction.status !== 'succeeded') {
      throw new Error(`圖片生成失敗: ${prediction.error || 'Unknown error'}`);
    }

    return prediction.output[0]; // 圖片 URL
  }

  /**
   * 下載圖片
   */
  private static async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  /**
   * 檢查快取
   */
  private static async checkCache(hash: string): Promise<string | null> {
    const cachePath = `${this.CACHE_DIR}/${hash}.png`;
    try {
      await fs.access(cachePath);
      return cachePath;
    } catch {
      return null;
    }
  }

  /**
   * 儲存快取
   */
  private static async saveCache(hash: string, imageBuffer: Buffer): Promise<void> {
    const cachePath = `${this.CACHE_DIR}/${hash}.png`;
    await fs.mkdir(this.CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, imageBuffer);
  }

  /**
   * 計算提示詞 hash（用於快取）
   */
  static calculateHash(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }
}
```

---

## DIDService

### 檔案位置
`src/main/services/DIDService.ts`

### 程式碼

```typescript
import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import { KeychainService } from './KeychainService';
import { retry } from '../utils/retry';

interface GenerateVideoRequest {
  portraitImagePath: string;
  audioPath: string;
  startTime: number;
  endTime: number;
  outputPath: string;
}

interface GenerateVideoResponse {
  videoPath: string;
  duration: number;
}

export class DIDService {
  private static readonly API_BASE_URL = 'https://api.d-id.com';

  /**
   * 生成對嘴影片
   */
  static async generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
    const apiKey = await KeychainService.getAPIKey('did');
    if (!apiKey) {
      throw new Error('D-ID API 金鑰未設定');
    }

    // 1. 上傳人像圖片
    const imageUrl = await this.uploadImage(request.portraitImagePath, apiKey);

    // 2. 上傳音檔
    const audioUrl = await this.uploadAudio(request.audioPath, apiKey);

    // 3. 建立對嘴影片任務
    const talkId = await this.createTalk(imageUrl, audioUrl, apiKey);

    // 4. 輪詢任務狀態
    const videoUrl = await retry(
      () => this.checkTalkStatus(talkId, apiKey),
      {
        retries: 30,
        delay: 2000,
      }
    );

    // 5. 下載影片
    const videoBuffer = await this.downloadVideo(videoUrl);

    // 6. 儲存影片
    await fs.writeFile(request.outputPath, videoBuffer);

    const duration = request.endTime - request.startTime;

    return {
      videoPath: request.outputPath,
      duration,
    };
  }

  /**
   * 上傳圖片到 D-ID
   */
  private static async uploadImage(imagePath: string, apiKey: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    const formData = new FormData();
    formData.append('image', imageBuffer, 'portrait.png');

    const response = await axios.post(
      `${this.API_BASE_URL}/images`,
      formData,
      {
        headers: {
          'Authorization': `Basic ${apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.url;
  }

  /**
   * 上傳音檔到 D-ID
   */
  private static async uploadAudio(audioPath: string, apiKey: string): Promise<string> {
    const audioBuffer = await fs.readFile(audioPath);
    const formData = new FormData();
    formData.append('audio', audioBuffer, 'audio.mp3');

    const response = await axios.post(
      `${this.API_BASE_URL}/audios`,
      formData,
      {
        headers: {
          'Authorization': `Basic ${apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.url;
  }

  /**
   * 建立對嘴影片任務
   */
  private static async createTalk(
    imageUrl: string,
    audioUrl: string,
    apiKey: string
  ): Promise<string> {
    const response = await axios.post(
      `${this.API_BASE_URL}/talks`,
      {
        source_url: imageUrl,
        script: {
          type: 'audio',
          audio_url: audioUrl,
        },
      },
      {
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id;
  }

  /**
   * 檢查任務狀態
   */
  private static async checkTalkStatus(talkId: string, apiKey: string): Promise<string> {
    const response = await axios.get(
      `${this.API_BASE_URL}/talks/${talkId}`,
      {
        headers: { 'Authorization': `Basic ${apiKey}` },
      }
    );

    const status = response.data.status;

    if (status === 'done') {
      return response.data.result_url;
    } else if (status === 'error') {
      throw new Error(`D-ID 生成失敗: ${response.data.error}`);
    } else {
      // 仍在處理中，拋出錯誤以觸發重試
      throw new Error('Still processing');
    }
  }

  /**
   * 下載影片
   */
  private static async downloadVideo(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}
```

---

## FFmpegService

### 檔案位置
`src/main/services/FFmpegService.ts`

### 程式碼

```typescript
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

interface VideoSegment {
  type: 'image' | 'video';
  path: string;
  duration?: number; // 僅圖片需要
  startTime: number;
  endTime: number;
}

interface Subtitle {
  text: string;
  startTime: number;
  endTime: number;
}

interface SubtitleStyle {
  position: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  shadowColor: string;
  borderColor?: string;
  backgroundColor?: string;
  backgroundPadding?: number;
}

interface LogoSettings {
  imagePath: string;
  position: { x: number; y: number };
  scale: number;
}

interface MergeVideoRequest {
  segments: VideoSegment[];
  audioPath: string;
  subtitles: Subtitle[];
  subtitleStyle: SubtitleStyle;
  logo?: LogoSettings;
  outputPath: string;
}

interface MergeVideoResponse {
  videoPath: string;
  duration: number;
  fileSize: number;
}

export class FFmpegService extends EventEmitter {
  /**
   * 合成最終影片
   */
  static async mergeVideo(request: MergeVideoRequest): Promise<MergeVideoResponse> {
    const service = new FFmpegService();

    // 1. 生成影片片段列表檔案
    const segmentListPath = await service.createSegmentList(request.segments);

    // 2. 生成字幕檔案 (SRT)
    const subtitlePath = await service.createSubtitleFile(request.subtitles);

    // 3. 使用 FFmpeg 合併
    await service.runFFmpeg({
      segmentListPath,
      audioPath: request.audioPath,
      subtitlePath,
      subtitleStyle: request.subtitleStyle,
      logo: request.logo,
      outputPath: request.outputPath,
    });

    // 4. 取得影片資訊
    const stats = await fs.stat(request.outputPath);
    const duration = request.segments[request.segments.length - 1].endTime;

    return {
      videoPath: request.outputPath,
      duration,
      fileSize: stats.size,
    };
  }

  /**
   * 建立影片片段列表檔案（FFmpeg concat 格式）
   */
  private async createSegmentList(segments: VideoSegment[]): Promise<string> {
    const listPath = '/tmp/segment_list.txt';
    let content = '';

    for (const segment of segments) {
      if (segment.type === 'image') {
        // 圖片需要指定持續時間
        content += `file '${segment.path}'\n`;
        content += `duration ${segment.duration}\n`;
      } else {
        // 影片直接加入
        content += `file '${segment.path}'\n`;
      }
    }

    await fs.writeFile(listPath, content);
    return listPath;
  }

  /**
   * 建立圖片轉場效果
   *
   * 若需要在圖片之間加入轉場效果(如淡入淡出、交叉溶解),
   * 則不使用 concat demuxer,改用 xfade 濾鏡
   *
   * @param segments 影片片段列表
   * @param transitionDuration 轉場持續時間(秒,預設 0.5)
   * @returns FFmpeg filter_complex 字串
   */
  private buildTransitionFilter(segments: VideoSegment[], transitionDuration: number = 0.5): string {
    // xfade 濾鏡範例:
    // [0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v01];
    // [v01][2:v]xfade=transition=fade:duration=0.5:offset=9.5[v02];
    // ...

    if (segments.length === 1) {
      return '[0:v]';  // 只有一個片段,無需轉場
    }

    let filterParts: string[] = [];
    let currentLabel = '0:v';
    let cumulativeTime = 0;

    for (let i = 0; i < segments.length - 1; i++) {
      const nextLabel = i === segments.length - 2 ? 'vout' : `v${i}`;
      const offset = cumulativeTime + segments[i].duration - transitionDuration;

      // 支援的轉場類型:
      // - fade: 淡入淡出
      // - wipeleft: 從左向右擦除
      // - wiperight: 從右向左擦除
      // - slidedown: 向下滑動
      // - circleopen: 圓形展開
      // 更多類型: https://trac.ffmpeg.org/wiki/Xfade

      filterParts.push(
        `[${currentLabel}][${i + 1}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${offset.toFixed(2)}[${nextLabel}]`
      );

      currentLabel = nextLabel;
      cumulativeTime += segments[i].duration;
    }

    return filterParts.join(';');
  }

  /**
   * 為靜態圖片加入 Ken Burns 效果（緩慢縮放和平移）
   *
   * 讓靜態圖片更有動態感
   *
   * @param imagePath 圖片路徑
   * @param duration 持續時間
   * @param zoomDirection 'in' (放大) 或 'out' (縮小)
   * @returns FFmpeg scale 和 zoompan 濾鏡字串
   */
  private buildKenBurnsEffect(
    imagePath: string,
    duration: number,
    zoomDirection: 'in' | 'out' = 'in'
  ): string {
    const fps = 30;
    const totalFrames = duration * fps;

    if (zoomDirection === 'in') {
      // 從 100% 放大到 120%
      return `zoompan=z='min(zoom+0.0015,1.2)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=${fps}:s=1920x1080`;
    } else {
      // 從 120% 縮小到 100%
      return `zoompan=z='if(lte(zoom,1.0),1.0,max(1.0,zoom-0.0015))':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=${fps}:s=1920x1080`;
    }
  }

  /**
   * 建立字幕檔案（SRT 格式）
   */
  private async createSubtitleFile(subtitles: Subtitle[]): Promise<string> {
    const srtPath = '/tmp/subtitles.srt';
    let content = '';

    subtitles.forEach((subtitle, index) => {
      const startTime = this.formatSRTTime(subtitle.startTime);
      const endTime = this.formatSRTTime(subtitle.endTime);

      content += `${index + 1}\n`;
      content += `${startTime} --> ${endTime}\n`;
      content += `${subtitle.text}\n\n`;
    });

    await fs.writeFile(srtPath, content);
    return srtPath;
  }

  /**
   * 格式化時間為 SRT 格式 (HH:MM:SS,mmm)
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  /**
   * 執行 FFmpeg
   */
  private runFFmpeg(options: {
    segmentListPath: string;
    audioPath: string;
    subtitlePath: string;
    subtitleStyle: SubtitleStyle;
    logo?: LogoSettings;
    outputPath: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // 輸入：影片片段列表
      command.input(options.segmentListPath)
        .inputOptions(['-f concat', '-safe 0']);

      // 輸入：音檔
      command.input(options.audioPath);

      // 字幕濾鏡
      const subtitleFilter = this.buildSubtitleFilter(options.subtitleStyle);
      let filterComplex = `[0:v]${subtitleFilter}[v1]`;

      // Logo 濾鏡（若有）
      if (options.logo) {
        command.input(options.logo.imagePath);
        const logoFilter = this.buildLogoFilter(options.logo);
        filterComplex += `;[v1][2:v]${logoFilter}[v2]`;
      }

      command.complexFilter(filterComplex);

      // 輸出設定
      command
        .outputOptions([
          '-map', options.logo ? '[v2]' : '[v1]',
          '-map', '1:a',

          // 影片編碼參數
          '-c:v', 'libx264',           // H.264 編碼器
          '-profile:v', 'high',         // H.264 profile (high = 最佳品質)
          '-level', '4.2',              // H.264 level (相容於大多數裝置)
          '-preset', 'medium',          // 編碼速度 vs 品質權衡 (ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow)
          '-crf', '18',                 // 恆定品質 (0-51, 18 = 視覺上無損, 23 = 預設, 28+ = 低品質)
          '-pix_fmt', 'yuv420p',        // 像素格式 (相容於所有播放器)
          '-movflags', '+faststart',    // 允許網頁串流播放 (將 moov atom 移到檔案開頭)

          // 解析度和幀率
          '-s', '1920x1080',            // 輸出解析度
          '-r', '30',                   // 幀率 30fps

          // 音訊編碼參數
          '-c:a', 'aac',                // AAC 音訊編碼器
          '-b:a', '192k',               // 音訊位元率 (128k=標準, 192k=高品質, 256k=極高品質)
          '-ar', '48000',               // 取樣率 48kHz (標準)
          '-ac', '2',                   // 音訊聲道數 (2 = 立體聲)

          // 音訊正規化 (避免音量過大或過小)
          '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',  // EBU R128 響度正規化
        ])
        .output(options.outputPath);

      // 進度事件
      command.on('progress', (progress) => {
        this.emit('progress', {
          stage: 'encoding',
          progress: progress.percent || 0,
          currentTime: progress.timemark,
        });
      });

      // 錯誤處理
      command.on('error', (err) => reject(err));

      // 完成
      command.on('end', () => resolve());

      // 開始執行
      command.run();
    });
  }

  /**
   * 建立字幕濾鏡
   */
  private buildSubtitleFilter(style: SubtitleStyle): string {
    // 使用 subtitles 濾鏡搭配 force_style
    // ASS 樣式參數說明:
    // - FontName: 字型名稱
    // - FontSize: 字型大小 (像素)
    // - PrimaryColour: 主要文字顏色 (&HAABBGGRR 格式)
    // - OutlineColour: 外框顏色 (用於陰影/描邊)
    // - Outline: 外框寬度 (像素)
    // - Shadow: 陰影距離 (像素)
    // - Alignment: 對齊方式 (2=底部居中, 5=中央, 8=頂部居中)
    // - MarginV: 垂直邊距 (像素)
    // - BackColour: 背景顏色 (若需要背景框)

    const alignment = this.getASSAlignment(style.position);
    const marginV = style.position === 'bottom' ? 60 : (style.position === 'top' ? 60 : 0);

    let forceStyle = [
      `FontName=${style.fontFamily}`,
      `FontSize=${style.fontSize}`,
      `PrimaryColour=${this.hexToASSColor(style.textColor)}`,
      `OutlineColour=${this.hexToASSColor(style.shadowColor)}`,
      `Outline=2`,  // 2px 描邊
      `Shadow=1`,   // 1px 陰影
      `Alignment=${alignment}`,
      `MarginV=${marginV}`
    ];

    // 若有邊框顏色,使用 BorderStyle=3 (背景框)
    if (style.borderColor) {
      forceStyle.push(`BorderStyle=3`);
      forceStyle.push(`OutlineColour=${this.hexToASSColor(style.borderColor)}`);
      forceStyle.push(`Outline=3`);
    }

    // 若有背景顏色
    if (style.backgroundColor) {
      forceStyle.push(`BackColour=${this.hexToASSColor(style.backgroundColor)}`);
      forceStyle.push(`BorderStyle=4`);  // 背景框樣式
    }

    return `subtitles=filename=/tmp/subtitles.srt:force_style='${forceStyle.join(',')}'`;
  }

  /**
   * 將位置字串轉換為 ASS 對齊數字
   * ASS Alignment 數字鍵盤對應:
   * 7 8 9  (top-left, top-center, top-right)
   * 4 5 6  (middle-left, center, middle-right)
   * 1 2 3  (bottom-left, bottom-center, bottom-right)
   */
  private getASSAlignment(position: string): number {
    const alignmentMap: { [key: string]: number } = {
      'top': 8,
      'middle': 5,
      'bottom': 2,
      'top-left': 7,
      'top-right': 9,
      'bottom-left': 1,
      'bottom-right': 3
    };
    return alignmentMap[position] || 2;  // 預設底部居中
  }

  /**
   * 建立 Logo 濾鏡
   */
  private buildLogoFilter(logo: LogoSettings): string {
    // overlay 濾鏡說明:
    // - x, y: Logo 位置座標
    // - 特殊值:
    //   - x=W-w-10: 螢幕寬度 - Logo寬度 - 10px (右對齊)
    //   - y=H-h-10: 螢幕高度 - Logo高度 - 10px (底部對齊)
    // - scale: 縮放濾鏡 (寬度:高度,或者 -1 表示維持比例)

    let overlayX: string;
    let overlayY: string;

    // 根據位置字串計算座標
    if (typeof logo.position.x === 'number') {
      overlayX = logo.position.x.toString();
    } else {
      // 支援特殊位置: 'left', 'center', 'right'
      overlayX = this.calculateLogoX(logo.position.x as string);
    }

    if (typeof logo.position.y === 'number') {
      overlayY = logo.position.y.toString();
    } else {
      // 支援特殊位置: 'top', 'middle', 'bottom'
      overlayY = this.calculateLogoY(logo.position.y as string);
    }

    // 若需要縮放 Logo
    if (logo.scale !== 1.0) {
      // 先 scale 再 overlay
      const scaledWidth = Math.round(1920 * logo.scale);  // 假設原始尺寸基於 1920x1080
      return `scale=${scaledWidth}:-1[logo];[v1][logo]overlay=${overlayX}:${overlayY}`;
    }

    return `overlay=${overlayX}:${overlayY}`;
  }

  /**
   * 計算 Logo X 座標
   */
  private calculateLogoX(position: string): string {
    switch (position) {
      case 'left':
        return '20';  // 左邊距 20px
      case 'center':
        return '(W-w)/2';  // 水平居中
      case 'right':
        return 'W-w-20';  // 右邊距 20px
      default:
        return '20';
    }
  }

  /**
   * 計算 Logo Y 座標
   */
  private calculateLogoY(position: string): string {
    switch (position) {
      case 'top':
        return '20';  // 上邊距 20px
      case 'middle':
        return '(H-h)/2';  // 垂直居中
      case 'bottom':
        return 'H-h-20';  // 下邊距 20px
      default:
        return '20';
    }
  }

  /**
   * 將 Hex 顏色轉換為 ASS 顏色格式
   */
  private hexToASSColor(hex: string): string {
    // ASS 格式: &HAABBGGRR (Alpha, Blue, Green, Red)
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5, 7);
    return `&H00${b}${g}${r}`;
  }
}
```

---

## YouTubeService

### 檔案位置
`src/main/services/YouTubeService.ts`

### 程式碼範例（簡化版）

```typescript
import { google } from 'googleapis';
import fs from 'fs';
import { KeychainService } from './KeychainService';

interface UploadVideoRequest {
  videoPath: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
  thumbnailPath?: string;
  publishAt?: string;
}

interface UploadVideoResponse {
  videoId: string;
  videoUrl: string;
  quotaUsed: number;
}

export class YouTubeService {
  /**
   * OAuth 2.0 認證
   */
  static async authenticate(): Promise<any> {
    // 使用 Google OAuth2 流程
    // 實際實作需要處理 redirect URI 和 token 儲存
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      'http://localhost'
    );

    // 這裡簡化處理，實際需要完整的 OAuth 流程
    return oauth2Client;
  }

  /**
   * 上傳影片
   */
  static async uploadVideo(request: UploadVideoRequest): Promise<UploadVideoResponse> {
    const auth = await this.authenticate();
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: request.title,
          description: request.description,
          tags: request.tags,
          categoryId: request.categoryId,
        },
        status: {
          privacyStatus: request.privacyStatus,
          publishAt: request.publishAt,
        },
      },
      media: {
        body: fs.createReadStream(request.videoPath),
      },
    });

    const videoId = response.data.id!;

    return {
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      quotaUsed: 1600, // 上傳影片消耗 1600 配額
    };
  }
}
```

---

## KeychainService

### 檔案位置
`src/main/services/KeychainService.ts`

### 程式碼

```typescript
import keytar from 'keytar';

const SERVICE_NAME = 'com.ytmaker3.apikeys';

export class KeychainService {
  /**
   * 取得 API 金鑰
   */
  static async getAPIKey(service: string): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, service);
  }

  /**
   * 儲存 API 金鑰
   */
  static async setAPIKey(service: string, apiKey: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, service, apiKey);
  }

  /**
   * 刪除 API 金鑰
   */
  static async deleteAPIKey(service: string): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, service);
  }

  /**
   * 檢查 API 金鑰是否存在
   */
  static async hasAPIKey(service: string): Promise<boolean> {
    const key = await this.getAPIKey(service);
    return key !== null;
  }
}
```

---

## 工具函式

### retry.ts - 重試機制

```typescript
export interface RetryOptions {
  retries: number;
  delay: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (options.onRetry) {
        options.onRetry(attempt, lastError);
      }

      if (attempt < options.retries) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
    }
  }

  throw lastError!;
}
```

### concurrentQueue.ts - 並發佇列

```typescript
export class ConcurrentQueue {
  private concurrency: number;
  private running: number = 0;
  private queue: Array<() => Promise<any>> = [];

  constructor(concurrency: number) {
    this.concurrency = concurrency;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.run();
    });
  }

  private async run() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.running++;

      task().finally(() => {
        this.running--;
        this.run();
      });
    }
  }
}
```

---

## 總結

所有服務封裝層都遵循以下原則：

1. **錯誤處理**：使用 try-catch 和重試機制
2. **類型安全**：完整的 TypeScript 類型定義
3. **快取機制**：減少重複 API 呼叫（Replicate）
4. **進度回報**：長時間任務提供進度事件（FFmpeg, YouTube）
5. **安全性**：API 金鑰使用 macOS Keychain 儲存
