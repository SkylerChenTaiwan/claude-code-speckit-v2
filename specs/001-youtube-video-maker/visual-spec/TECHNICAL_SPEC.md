# 補充規格文件

本文件包含 visual-spec 中被指出缺失的補充規格。

---

## 8. D-ID 人像圖片的具體要求

### 圖片格式和尺寸

- **支援格式**: PNG, JPG, JPEG
- **檔案大小**: 最大 8MB
- **最小解析度**: 256x256 像素
- **建議解析度**: 512x512 或 1024x1024 像素
- **寬高比**: 建議 1:1 (正方形)

### 人臉要求

**人臉數量**:
- ✅ 僅支援單一人像 - 圖片中只能有一張臉
- ❌ 不支援多人合照

**人臉大小**:
- 人臉必須佔圖片面積的至少 **20%**
- 建議人臉佔圖片面積的 **30-50%**

**人臉角度**:
- ✅ 正面或接近正面 (左右偏轉 < 30°)
- ❌ 側臉或過度偏轉的角度
- ✅ 輕微仰/俯視角可接受 (上下偏轉 < 20°)

**人臉清晰度**:
- ✅ 臉部特徵清晰可見 (眼睛、鼻子、嘴巴)
- ❌ 模糊、失焦、像素化的圖片

### 照明和品質

- ✅ 均勻、充足的照明
- ✅ 臉部無明顯陰影
- ❌ 逆光照片 (臉部過暗)
- ❌ 過度曝光

### 遮擋物

- ❌ 嘴巴和下巴不可被遮擋
- ❌ 口罩、圍巾、手等遮住嘴部
- ⚠️ 眼鏡可接受,但不建議墨鏡
- ✅ 帽子可接受,但不要遮到眉毛以下

---

## 9. 影片預覽的「預覽版」vs「最終版」差異

### 預覽版 (Preview Version)

用於快速預覽,生成速度快但品質較低。

**解析度**: 720p (1280x720)

**編碼參數**:
```
-c:v libx264
-preset ultrafast     // 最快編碼
-crf 28               // 較低品質
-s 1280x720
-r 24                 // 24fps (較低幀率)
```

**省略的效果**:
- 字幕使用簡單渲染 (無陰影、無背景)
- Logo 使用較低解析度
- 不執行轉場效果 (直接切換)
- 不執行 Ken Burns 效果
- 音訊不正規化

**生成時間**: 通常 10-30 秒 (依影片長度)

### 最終版 (Final Version)

用於輸出和上傳,高品質完整效果。

**解析度**: 1080p (1920x1080)

**編碼參數**:
```
-c:v libx264
-profile:v high
-preset medium        // 平衡品質與速度
-crf 18               // 高品質 (視覺上無損)
-s 1920x1080
-r 30                 // 30fps
-pix_fmt yuv420p
-movflags +faststart
```

**完整效果**:
- 字幕完整渲染 (陰影、描邊、背景)
- Logo 完整解析度疊加
- 圖片轉場效果 (xfade, 0.5s duration)
- Ken Burns 效果 (緩慢縮放)
- 音訊 EBU R128 正規化

**生成時間**: 通常 2-5 分鐘 (依影片長度和電腦效能)

### 使用者選擇

```
┌────────────────────────────────────────┐
│  影片預覽                               │
│                                        │
│  [預覽版] [最終版]                     │
│                                        │
│  預覽版: 快速生成,適合查看流程         │
│  最終版: 高品質輸出,用於上傳           │
└────────────────────────────────────────┘
```

---

## 10. YouTube 分類的完整列表順序

依照 YouTube Data API v3 的官方分類 ID 順序:

```typescript
const YOUTUBE_CATEGORIES = [
  { id: "1", name: "影片和動畫", nameEn: "Film & Animation" },
  { id: "2", name: "汽車與交通工具", nameEn: "Autos & Vehicles" },
  { id: "10", name: "音樂", nameEn: "Music" },
  { id: "15", name: "寵物和動物", nameEn: "Pets & Animals" },
  { id: "17", name: "運動", nameEn: "Sports" },
  { id: "18", name: "短片", nameEn: "Short Movies" },
  { id: "19", name: "旅遊和活動", nameEn: "Travel & Events" },
  { id: "20", name: "遊戲", nameEn: "Gaming" },
  { id: "21", name: "影音部落格", nameEn: "Videoblogging" },
  { id: "22", name: "大眾與部落格", nameEn: "People & Blogs" },
  { id: "23", name: "喜劇", nameEn: "Comedy" },
  { id: "24", name: "娛樂", nameEn: "Entertainment" },
  { id: "25", name: "新聞與政治", nameEn: "News & Politics" },
  { id: "26", name: "生活妙招和風格", nameEn: "Howto & Style" },
  { id: "27", name: "教育", nameEn: "Education" },
  { id: "28", name: "科學與技術", nameEn: "Science & Technology" },
  { id: "29", name: "非營利組織與社會運動", nameEn: "Nonprofits & Activism" }
];
```

**預設值**: "27" (教育) - 適合大多數知識型影片

**顯示順序**: 按照 YouTube 官方順序 (依 ID)

**本地化**: 顯示繁體中文名稱,但送出時使用英文 ID

---

## 14. 語音試聽的範例文字

```typescript
const VOICE_SAMPLE_TEXT = "歡迎使用 YTMaker3 影片製作工具。這是 {語音名稱} 的試聽範例。";

// 針對不同語音的範例文字
const VOICE_SAMPLES = {
  "zh-TW-HsiaoChenNeural": "大家好，我是小晨。今天要跟大家分享一些實用的技巧。",
  "zh-TW-YunJheNeural": "各位觀眾好，我是雲哲。很高興能為您朗讀這段內容。",
  "zh-TW-HsiaoYuNeural": "哈囉！我是曉育，讓我用輕鬆活潑的口吻來說明吧！"
};

// 預設範例（當語音沒有特定範例時）
const DEFAULT_SAMPLE = "這是一段語音試聽範例。透過這段文字，您可以了解這個語音的音色、語調和風格。";
```

**試聽按鈕行為**:
1. 點擊「試聽」按鈕
2. 顯示 Loading 狀態 (按鈕文字變為 "生成中...")
3. 呼叫 Google TTS API 生成音檔
4. 使用 HTML5 Audio 播放
5. 播放完畢後按鈕恢復 "試聽"

---

## 15. Logo 支援的圖片格式

**支援格式**: PNG (推薦), JPG, JPEG, SVG

**建議使用 PNG 的原因**:
- 支援透明背景 (Alpha channel)
- 疊加在影片上效果更好
- 無損壓縮,品質更高

**各格式說明**:

**PNG (推薦)**:
- ✅ 支援透明背景
- ✅ 無損壓縮
- ✅ 適合 Logo 和圖示
- 建議尺寸: 512x512 或更大

**JPG/JPEG (可用)**:
- ❌ 不支援透明背景 (會有白色或黑色背景)
- ⚠️ 有損壓縮,品質略差
- ⚠️ 疊加時需要手動移除背景

**SVG (有限支援)**:
- ✅ 向量格式,任意縮放不失真
- ⚠️ FFmpeg 不直接支援 SVG
- ⚠️ 需要先轉換為 PNG 才能疊加
- 實作: 使用 `sharp` 或 `svg2png` 轉換

**檔案大小限制**: 最大 5MB

**錯誤處理**:

若使用者上傳不支援的格式:
```
錯誤訊息: "不支援的圖片格式"
說明: "請使用 PNG (推薦)、JPG 或 SVG 格式的圖片"
操作: [重新選擇]
```

若使用 JPG 無透明背景:
```
警告訊息: "JPG 格式不支援透明背景"
說明: "建議使用 PNG 格式以獲得更好的疊加效果"
操作: [繼續使用] [重新選擇PNG]
```

---

## 16. 專案檔案的備份機制

### 自動備份策略

**觸發時機**:
- 每次儲存專案時自動建立備份
- 重要操作前建立備份 (如生成影片、大量編輯)

**備份頻率**:
- 每次修改後儲存時建立備份
- 最多保留 **最近 10 個備份**
- 超過 10 個時自動刪除最舊的備份

**備份存放位置**:
```
~/Documents/YTMaker3/{projectName}/
├── {projectName}.json           // 主專案檔案
├── .backups/                    // 備份目錄 (隱藏)
│   ├── backup-20250129-143022.json
│   ├── backup-20250129-143155.json
│   └── backup-20250129-144301.json
└── output/                      // 輸出檔案
```

**備份檔案命名**: `backup-{YYYYMMDD}-{HHMMSS}.json`

### 備份管理 UI

在「載入專案錯誤」對話框中提供「查看備份」按鈕:

```
┌────────────────────────────────────────────┐
│  可用的備份版本                        [✕] │
├────────────────────────────────────────────┤
│  選擇要還原的備份版本:                    │
│                                            │
│  ○ 2025/01/29 14:43:01 (5 分鐘前)        │
│     階段: 腳本編輯                         │
│     大小: 245 KB                           │
│                                            │
│  ○ 2025/01/29 14:30:22 (18 分鐘前)       │
│     階段: 文稿輸入                         │
│     大小: 182 KB                           │
│                                            │
│  ○ 2025/01/29 13:15:45 (1 小時前)        │
│     階段: 影片預覽                         │
│     大小: 512 KB                           │
│                                            │
├────────────────────────────────────────────┤
│                     [取消] [還原選擇的版本]│
└────────────────────────────────────────────┘
```

### 備份資訊

備份檔案中包含額外的 metadata:

```typescript
interface BackupMetadata {
  originalFilePath: string;
  backupTimestamp: string;  // ISO 8601
  currentStage: string;
  fileSize: number;
  appVersion: string;
}
```

---

## 17. 應用程式偏好設定對話框

開啟方式: 點擊首頁右上角的「設定」按鈕

```
┌─────────────────────────────────────────────────────────┐
│  偏好設定                                          [✕]  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─ 一般設定 ─────────────────────────────────────┐    │
│  │  預設輸出路徑                                     │    │
│  │  ┌───────────────────────────────┐ [瀏覽]        │    │
│  │  │ ~/Documents/YTMaker3          │              │    │
│  │  └───────────────────────────────┘              │    │
│  │                                                   │    │
│  │  □ 儲存時自動備份專案檔案                        │    │
│  │  □ 開啟時載入上次的專案                          │    │
│  └───────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ 預設值設定 ───────────────────────────────────┐    │
│  │  預設語音                                         │    │
│  │  ┌───────────────────────────────┐              │    │
│  │  │ zh-TW-HsiaoChenNeural (小晨)  │ ▼            │    │
│  │  └───────────────────────────────┘              │    │
│  │                                                   │    │
│  │  預設圖片風格                                     │    │
│  │  ○ 真實攝影風格  ○ 可愛插畫風格                  │    │
│  │  ○ 中國古典風格  ○ 兒童繪本風格                  │    │
│  │                                                   │    │
│  │  預設字幕位置                                     │    │
│  │  ○ 底部  ○ 中央  ○ 頂部                         │    │
│  └───────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ 快取設定 ─────────────────────────────────────┐    │
│  │  圖片快取大小上限                                 │    │
│  │  ┌──────┐ GB                                     │    │
│  │  │  5   │                                        │    │
│  │  └──────┘                                        │    │
│  │                                                   │    │
│  │  □ 啟用自動清理快取 (超過 30 天未使用)           │    │
│  │                                                   │    │
│  │  目前快取大小: 1.2 GB / 5 GB                     │    │
│  │  [立即清理快取]                                   │    │
│  └───────────────────────────────────────────────┘    │
│                                                           │
│  ┌─ 外觀 ───────────────────────────────────────────┐    │
│  │  主題                                             │    │
│  │  ○ 淺色  ○ 深色  ○ 跟隨系統                      │    │
│  └───────────────────────────────────────────────┘    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                       [重設為預設值] [取消] [儲存]       │
└─────────────────────────────────────────────────────────┘
```

---

## 18. Google TTS API 的完整參數

```typescript
interface TTSRequest {
  input: {
    ssml: string;  // SSML 格式的文字
  };
  voice: {
    languageCode: string;    // "zh-TW"
    name: string;            // "zh-TW-HsiaoChenNeural"
    ssmlGender?: "FEMALE" | "MALE" | "NEUTRAL";
  };
  audioConfig: {
    audioEncoding: "MP3" | "OGG_OPUS" | "LINEAR16";
    speakingRate: number;    // 0.25 - 4.0, 預設 1.0
    pitch: number;           // -20.0 - 20.0, 預設 0.0
    volumeGainDb: number;    // -96.0 - 16.0, 預設 0.0
    sampleRateHertz?: number;  // 22050, 24000, 32000, 44100, 48000
    effectsProfileId?: string[];  // 音效設定檔
  };
  enableTimePointing?: string[];  // ["TIMEPOINT_TYPE_SSML_MARK"]
}
```

**預設參數**:
```typescript
const DEFAULT_TTS_CONFIG = {
  audioEncoding: "MP3",
  speakingRate: 1.0,    // 正常速度
  pitch: 0.0,           // 正常音高
  volumeGainDb: 0.0,    // 正常音量
  sampleRateHertz: 48000  // 48kHz 高品質
};
```

---

## 19. Replicate FLUX API 的具體模型版本

**使用的模型**: `black-forest-labs/flux-schnell`

**模型資訊**:
- 版本: FLUX.1 [schnell]
- 特性: 快速生成 (1-4 步)
- 解析度: 支援 1024x1024, 1920x1080 等

**API 參數**:
```typescript
const REPLICATE_API_CONFIG = {
  model: "black-forest-labs/flux-schnell",
  input: {
    prompt: string,           // 圖片提示詞
    negative_prompt: string,  // 負面提示詞
    width: 1920,             // 寬度
    height: 1080,            // 高度
    num_inference_steps: 4,  // FLUX Schnell 推薦 1-4 步
    guidance_scale: 0,       // FLUX Schnell 不使用 guidance
    num_outputs: 1,          // 生成數量
    output_format: "png",    // 輸出格式
    output_quality: 90       // 品質 (1-100)
  }
};
```

---

## 20. D-ID API 的 webhook 或 polling 策略

**使用策略**: Polling (輪詢)

D-ID 影片生成是異步的,使用 polling 檢查生成狀態:

```typescript
interface DIDPollingConfig {
  initialDelay: 5000;      // 首次查詢延遲 5 秒
  pollingInterval: 3000;   // 每 3 秒查詢一次
  maxPollingTime: 300000;  // 最長等待 5 分鐘
  maxRetries: 100;         // 最多查詢 100 次
}

async function waitForDIDVideo(talkId: string): Promise<string> {
  const startTime = Date.now();

  // 首次延遲
  await sleep(config.initialDelay);

  while (true) {
    // 檢查是否逾時
    if (Date.now() - startTime > config.maxPollingTime) {
      throw new Error('D-ID 影片生成逾時');
    }

    // 查詢狀態
    const response = await axios.get(
      `https://api.d-id.com/talks/${talkId}`,
      { headers: { 'x-api-key': apiKey } }
    );

    const status = response.data.status;

    if (status === 'done') {
      // 生成完成
      return response.data.result_url;
    } else if (status === 'error') {
      // 生成失敗
      throw new Error(response.data.error.message);
    } else if (status === 'started' || status === 'created') {
      // 仍在處理中，繼續等待
      await sleep(config.pollingInterval);
    }
  }
}
```

**狀態顯示**:
```
正在生成對嘴影片...
已等待: 15 秒 / 最長 5 分鐘
狀態: 處理中
```

---

## 22. IPC 錯誤處理的標準格式

```typescript
interface IPCError {
  code: string;        // 錯誤代碼
  message: string;     // 使用者可讀訊息 (繁體中文)
  details?: any;       // 技術細節 (選用)
  recoverable: boolean;  // 是否可恢復
}

// 錯誤代碼規範
const ERROR_CODES = {
  // API 相關 (1xxx)
  "API_KEY_INVALID": "1001",
  "API_KEY_MISSING": "1002",
  "API_RATE_LIMIT": "1003",
  "API_TIMEOUT": "1004",
  "API_SERVER_ERROR": "1005",

  // 檔案相關 (2xxx)
  "FILE_NOT_FOUND": "2001",
  "FILE_READ_ERROR": "2002",
  "FILE_WRITE_ERROR": "2003",
  "FILE_PERMISSION_DENIED": "2004",

  // 專案相關 (3xxx)
  "PROJECT_INVALID": "3001",
  "PROJECT_CORRUPTED": "3002",
  "PROJECT_VERSION_MISMATCH": "3003",

  // 媒體相關 (4xxx)
  "MEDIA_GENERATION_FAILED": "4001",
  "MEDIA_INVALID_FORMAT": "4002",
  "FFMPEG_ERROR": "4003"
};
```

---

## 11. 快取管理對話框的詳細規格

開啟方式: 首頁點擊「清理快取」按鈕

```
┌────────────────────────────────────────────────────────┐
│  快取管理                                         [✕]  │
├────────────────────────────────────────────────────────┤
│  快取位置: ~/Library/Caches/YTMaker3/                 │
│  總快取大小: 2.4 GB / 5 GB (48%)                      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  類型          項目數    大小        最後使用    │ │
│  ├──────────────────────────────────────────────────┤ │
│  │  □ 圖片快取     127      1.8 GB     2 天前     │ │
│  │  □ 音訊快取      45      512 MB     1 小時前   │ │
│  │  □ 影片快取       8       95 MB     昨天       │ │
│  │  □ 臨時檔案      23       12 MB     5 分鐘前   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  清理策略:                                             │
│  ○ 清理所有快取                                        │
│  ○ 清理超過 30 天未使用的快取                         │
│  ○ 清理超過 7 天未使用的快取                          │
│  ○ 僅清理選擇的項目                                   │
│                                                        │
│  預計釋放空間: 0 MB                                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                 [取消] [開始清理]      │
└────────────────────────────────────────────────────────┘
```

**功能**:
- 顯示各類快取的大小和項目數
- 支援選擇性清理或全部清理
- 顯示預計釋放空間
- 清理後顯示結果摘要

---

## 12. 範本管理對話框的詳細規格

開啟方式: 首頁點擊「管理範本」按鈕

```
┌───────────────────────────────────────────────────────────┐
│  範本管理                                            [✕]  │
├───────────────────────────────────────────────────────────┤
│  [+ 從當前專案建立範本]                                   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [圖示] 教育影片範本                                  │ │
│  │        建立於: 2025/01/15                            │ │
│  │        包含: 語音設定、字幕樣式、Logo               │ │
│  │                                                      │ │
│  │        [套用] [編輯] [刪除]                          │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ [圖示] Vlog 風格範本                                │ │
│  │        建立於: 2025/01/10                            │ │
│  │        包含: 語音設定、圖片風格、字幕樣式           │ │
│  │                                                      │ │
│  │        [套用] [編輯] [刪除]                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                              [關閉]        │
└───────────────────────────────────────────────────────────┘
```

**範本包含的設定**:
- 語音選擇 (voiceId)
- 圖片風格 (imageStyle)
- 字幕樣式 (subtitleStyle)
- Logo 設定
- D-ID 設定

---

## 13. 「查看全部專案」對話框的規格

開啟方式: 首頁點擊「查看全部」連結

```
┌──────────────────────────────────────────────────────────┐
│  所有專案                                           [✕]  │
├──────────────────────────────────────────────────────────┤
│  排序: [最近修改 ▼]  搜尋: [____________] 🔍            │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [縮圖] 專案A                      2025/01/29 14:30 │ │
│  │        階段: 影片預覽              大小: 125 MB    │ │
│  │        [開啟] [刪除]                               │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ [縮圖] 專案B                      2025/01/28 10:15 │ │
│  │        階段: 腳本編輯              大小: 45 MB     │ │
│  │        [開啟] [刪除]                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  共 15 個專案                                             │
│                                                           │
├──────────────────────────────────────────────────────────┤
│                                               [關閉]      │
└──────────────────────────────────────────────────────────┘
```

**功能**:
- 排序: 最近修改、名稱、建立時間
- 搜尋: 依專案名稱搜尋
- 批次操作: 可選多個專案刪除

---

## 21. 狀態管理 (Zustand Store) 的完整 Interface

```typescript
// stores/projectStore.ts
interface ProjectState {
  // 基本資訊
  projectName: string;
  projectPath: string;
  createdAt: string;
  lastModified: string;
  currentStage: 'script-input' | 'script-editor' | 'video-preview' | 'youtube-upload' | 'completed';

  // 文稿和音訊
  scriptContent: string;
  audioFile: string | null;
  selectedVoice: string;
  timecodes: Timecode[];

  // 腳本段落
  paragraphs: Paragraph[];

  // 圖片設定
  imageStyle: 'realistic' | 'cute-illustration' | 'chinese-classic' | 'children';

  // D-ID 設定
  useDID: boolean;
  didPortraitImage: string | null;

  // 字幕設定
  subtitleStyle: SubtitleStyle;

  // Logo 設定
  logo: LogoSettings | null;

  // Actions
  setProjectName: (name: string) => void;
  setScriptContent: (content: string) => void;
  setParagraphs: (paragraphs: Paragraph[]) => void;
  // ... 其他 actions
}

// stores/uiStore.ts
interface UIState {
  // 載入狀態
  isLoading: boolean;
  loadingMessage: string;

  // 進度
  progress: number;
  progressStage: string;

  // 錯誤
  error: string | null;
  errorDetails: any;

  // 對話框狀態
  isModalOpen: boolean;
  modalType: 'api-keys' | 'settings' | 'error' | null;

  // Actions
  showLoading: (message: string) => void;
  hideLoading: () => void;
  setProgress: (progress: number, stage: string) => void;
  showError: (error: string, details?: any) => void;
  // ...
}

// stores/settingsStore.ts
interface SettingsState {
  // 預設值
  defaultVoice: string;
  defaultImageStyle: string;
  defaultSubtitlePosition: 'top' | 'middle' | 'bottom';
  defaultOutputPath: string;

  // 快取設定
  cacheMaxSize: number;  // GB
  autoCleanCache: boolean;

  // 偏好設定
  theme: 'light' | 'dark' | 'system';
  autoBackup: boolean;
  loadLastProject: boolean;

  // Actions
  loadSettings: () => void;
  saveSettings: () => void;
  resetToDefaults: () => void;
}
```

---

## 24. API 重試策略參數

所有外部 API 呼叫 (Gemini, Replicate, D-ID, Google TTS, YouTube) 都使用統一的重試策略：

### 重試參數

```typescript
interface RetryConfig {
  maxRetries: 3;              // 最多重試 3 次
  initialDelay: 1000;         // 首次重試延遲 1 秒
  maxDelay: 10000;            // 最長延遲 10 秒
  backoffMultiplier: 2;       // 每次延遲加倍
  timeout: 30000;             // 單次請求逾時 30 秒
}

// 實際延遲時間計算
// 第 1 次重試: 1 秒
// 第 2 次重試: 2 秒
// 第 3 次重試: 4 秒
```

### 可重試 vs 不可重試的錯誤

**可重試的錯誤** (會自動重試):
- `429` - Rate Limit (速率限制)
- `500` - Internal Server Error (伺服器內部錯誤)
- `502` - Bad Gateway (閘道錯誤)
- `503` - Service Unavailable (服務暫時無法使用)
- `504` - Gateway Timeout (閘道逾時)
- `ETIMEDOUT` - 連線逾時
- `ECONNRESET` - 連線重置

**不可重試的錯誤** (直接失敗):
- `400` - Bad Request (請求格式錯誤)
- `401` - Unauthorized (API Key 無效)
- `403` - Forbidden (權限不足)
- `404` - Not Found (資源不存在)
- `422` - Unprocessable Entity (參數驗證失敗)

### 重試實作範例

```typescript
async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // 檢查是否可重試
      if (!isRetryableError(error) || attempt === config.maxRetries) {
        throw error;
      }

      // 計算延遲時間
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      console.log(`[Retry] Attempt ${attempt + 1}/${config.maxRetries}, waiting ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}
```

---

## 25. 進度計算權重分配

整個影片生成流程的進度計算，依各階段的實際耗時分配權重：

### 各階段權重分配

```typescript
const PROGRESS_WEIGHTS = {
  // 1. 文稿解析 (1%)
  scriptParsing: 0.01,

  // 2. 生成音訊 (5%)
  audioGeneration: 0.05,

  // 3. 時間軸分析 (2%)
  timecodeAnalysis: 0.02,

  // 4. 生成圖片 (40%) - 最耗時
  imageGeneration: 0.40,

  // 5. 生成 D-ID 影片 (30%) - 次耗時 (如果啟用)
  didVideoGeneration: 0.30,

  // 6. 影片合成 (20%)
  videoComposition: 0.20,

  // 7. 影片渲染 (2%)
  videoRendering: 0.02
};

// 如果未使用 D-ID，重新分配權重
const PROGRESS_WEIGHTS_NO_DID = {
  scriptParsing: 0.01,
  audioGeneration: 0.07,
  timecodeAnalysis: 0.02,
  imageGeneration: 0.60,    // 佔比提高
  videoComposition: 0.25,   // 佔比提高
  videoRendering: 0.05
};
```

### 子任務進度計算

對於有多個子任務的階段 (如批次生成圖片):

```typescript
// 假設有 10 張圖片要生成
const totalImages = 10;
const imageWeight = PROGRESS_WEIGHTS.imageGeneration; // 0.40

for (let i = 0; i < totalImages; i++) {
  // 當前圖片的進度貢獻
  const imageProgress = (i + 1) / totalImages * imageWeight;

  // 總進度 = 前面階段 + 當前階段進度
  const totalProgress =
    PROGRESS_WEIGHTS.scriptParsing +
    PROGRESS_WEIGHTS.audioGeneration +
    PROGRESS_WEIGHTS.timecodeAnalysis +
    imageProgress;

  updateProgress(totalProgress * 100); // 轉為百分比
}
```

### 進度更新頻率

- **快速任務** (解析、分析): 完成時更新一次
- **批次任務** (圖片生成): 每完成一個項目更新一次
- **長時間任務** (FFmpeg 渲染): 每秒更新一次

### FFmpeg 進度讀取方式

FFmpeg 輸出進度資訊到 stderr，透過解析輸出讀取進度：

```typescript
function parseFFmpegProgress(
  line: string,
  totalDuration: number
): number {
  // FFmpeg 輸出格式: time=00:01:23.45 ...
  const timeMatch = line.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);

  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const seconds = parseFloat(timeMatch[3]);

    const currentTime = hours * 3600 + minutes * 60 + seconds;
    const progress = currentTime / totalDuration;

    return Math.min(progress, 1.0); // 確保不超過 100%
  }

  return 0;
}

// 使用範例
const ffmpegProcess = spawn('ffmpeg', [...args]);

ffmpegProcess.stderr.on('data', (data) => {
  const line = data.toString();
  const progress = parseFFmpegProgress(line, totalDuration);

  // 更新 UI 進度
  const videoRenderProgress = progress * PROGRESS_WEIGHTS.videoRendering;
  updateProgress(baseProgress + videoRenderProgress * 100);
});
```

---

## 26. 並發控制限制

為避免 API Rate Limit 和系統資源過載，設定並發控制：

### 並發參數

```typescript
const CONCURRENCY_LIMITS = {
  // 圖片生成 (Replicate API)
  imageGeneration: {
    maxConcurrent: 3,        // 同時最多 3 個請求
    queueStrategy: 'fifo',   // 先進先出
    retryOnLimit: true       // Rate limit 時自動重試
  },

  // D-ID 影片生成
  didVideoGeneration: {
    maxConcurrent: 2,        // 同時最多 2 個請求
    queueStrategy: 'fifo'
  },

  // Google TTS
  ttsGeneration: {
    maxConcurrent: 5,        // TTS 較輕量，可多並發
    queueStrategy: 'fifo'
  },

  // API Rate Limiting
  rateLimits: {
    replicate: {
      requestsPerMinute: 50,
      requestsPerHour: 500
    },
    gemini: {
      requestsPerMinute: 60,
      requestsPerDay: 1500
    },
    did: {
      requestsPerMinute: 10,
      concurrentVideos: 3     // D-ID 限制同時生成數
    },
    googleTTS: {
      requestsPerMinute: 100,
      charactersPerMinute: 100000
    }
  }
};
```

### 佇列管理實作

使用 `p-queue` 套件管理並發:

```typescript
import PQueue from 'p-queue';

// 圖片生成佇列
const imageQueue = new PQueue({
  concurrency: CONCURRENCY_LIMITS.imageGeneration.maxConcurrent
});

// 批次生成圖片
async function generateImagesWithQueue(
  prompts: string[]
): Promise<string[]> {
  const tasks = prompts.map((prompt, index) =>
    imageQueue.add(async () => {
      console.log(`[Queue] Generating image ${index + 1}/${prompts.length}`);
      const imageUrl = await generateImage(prompt);
      updateProgress(index + 1, prompts.length);
      return imageUrl;
    })
  );

  return Promise.all(tasks);
}
```

### Rate Limiting 實作

```typescript
import Bottleneck from 'bottleneck';

// 建立 Rate Limiter
const replicateLimiter = new Bottleneck({
  minTime: 1200,           // 每個請求至少間隔 1.2 秒 (50/min)
  maxConcurrent: 3,
  reservoir: 500,          // 每小時配額
  reservoirRefreshAmount: 500,
  reservoirRefreshInterval: 60 * 60 * 1000  // 1 小時
});

// 使用 Limiter 包裝 API 呼叫
const generateImageWithLimit = replicateLimiter.wrap(
  async (prompt: string) => {
    return await replicateAPI.generate(prompt);
  }
);
```

---

## 27. 狀態同步時機

專案狀態自動儲存和同步機制：

### 自動儲存時機

```typescript
const AUTO_SAVE_CONFIG = {
  // 自動儲存間隔
  autoSaveInterval: 30000,    // 30 秒

  // 觸發儲存的操作
  saveOnActions: [
    'paragraph-edited',       // 編輯段落
    'image-generated',        // 圖片生成完成
    'audio-generated',        // 音訊生成完成
    'settings-changed',       // 設定變更
    'stage-changed'           // 階段切換
  ],

  // 延遲儲存 (防止頻繁寫入)
  debounceDelay: 1000        // 1 秒
};
```

### 樂觀更新 + 回滾機制

```typescript
interface OptimisticUpdate {
  // 樂觀更新: 先更新 UI，再儲存到檔案
  async updateParagraph(id: string, newContent: string) {
    // 1. 備份當前狀態
    const backup = this.createStateSnapshot();

    // 2. 立即更新 UI (樂觀更新)
    this.setState({
      paragraphs: this.state.paragraphs.map(p =>
        p.id === id ? { ...p, content: newContent } : p
      )
    });

    try {
      // 3. 儲存到檔案
      await this.saveToFile();
    } catch (error) {
      // 4. 儲存失敗，回滾狀態
      console.error('[AutoSave] Failed, rolling back', error);
      this.restoreStateSnapshot(backup);

      // 5. 顯示錯誤訊息
      showError('儲存失敗，已恢復到上一個狀態');
    }
  }
}
```

### 衝突解決策略

當檔案被外部修改時 (如使用者手動編輯 JSON):

```typescript
async function loadProjectWithConflictDetection(
  projectPath: string
) {
  // 讀取檔案
  const fileContent = await fs.readFile(projectPath, 'utf-8');
  const fileData = JSON.parse(fileContent);

  // 檢查時間戳
  if (this.state.lastModified &&
      fileData.lastModified > this.state.lastModified) {
    // 檔案較新，詢問使用者
    const choice = await showDialog({
      title: '專案檔案已被修改',
      message: '專案檔案在外部被修改過，要載入最新版本嗎？',
      buttons: ['載入最新版本', '保留當前版本', '顯示差異']
    });

    if (choice === '載入最新版本') {
      this.loadState(fileData);
    } else if (choice === '顯示差異') {
      showDiffDialog(this.state, fileData);
    }
  }
}
```

### Debounce 儲存

避免使用者連續編輯時頻繁寫入檔案:

```typescript
import { debounce } from 'lodash';

// Debounced save function
const debouncedSave = debounce(
  async () => {
    await saveProjectToFile();
    console.log('[AutoSave] Project saved');
  },
  AUTO_SAVE_CONFIG.debounceDelay,
  { maxWait: 5000 }  // 最長 5 秒必須儲存一次
);

// 使用者每次編輯時呼叫
function onContentChange() {
  debouncedSave();
}
```

---

## 28. 日誌與除錯規範

### 日誌等級定義

```typescript
enum LogLevel {
  ERROR = 0,    // 錯誤: API 失敗、FFmpeg 崩潰、未處理的例外
  WARN = 1,     // 警告: 重試嘗試、快取未命中、慢速操作
  INFO = 2,     // 資訊: 使用者操作、狀態變更、重要里程碑
  DEBUG = 3     // 除錯: API 請求/回應、快取命中、進度更新
}

// 環境設定
const LOG_LEVEL = process.env.NODE_ENV === 'production'
  ? LogLevel.INFO
  : LogLevel.DEBUG;
```

### 日誌格式

```typescript
interface LogEntry {
  timestamp: string;        // ISO 8601 格式
  level: LogLevel;
  category: string;         // 'api' | 'ffmpeg' | 'ui' | 'ipc' | 'file'
  message: string;
  context?: Record<string, any>;  // 額外資訊
  userId?: string;          // 使用者 ID (如果有)
  sessionId: string;        // Session ID (每次啟動 App 生成)
}

// 範例
{
  "timestamp": "2025-01-29T14:30:22.123Z",
  "level": "ERROR",
  "category": "api",
  "message": "Replicate API failed",
  "context": {
    "errorCode": "1003",
    "endpoint": "/predictions",
    "retryAttempt": 3
  },
  "sessionId": "abc123"
}
```

### 敏感資訊脫敏規則

```typescript
function sanitizeLog(data: any): any {
  const sensitiveKeys = [
    'apiKey', 'api_key', 'authorization',
    'password', 'token', 'secret'
  ];

  if (typeof data !== 'object') return data;

  const sanitized = { ...data };

  for (const key in sanitized) {
    // 1. API Key 脫敏
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = maskString(sanitized[key]);
    }

    // 2. 檔案路徑只保留檔名
    if (key.includes('path') || key.includes('Path')) {
      sanitized[key] = path.basename(sanitized[key]);
    }

    // 3. 使用者輸入的 prompt 截斷
    if (key === 'prompt' && sanitized[key].length > 50) {
      sanitized[key] = sanitized[key].substring(0, 50) + '...';
    }

    // 遞迴處理巢狀物件
    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLog(sanitized[key]);
    }
  }

  return sanitized;
}

// API Key 遮罩: sk-abc123def456 -> sk-***456
function maskString(str: string): string {
  if (!str || str.length < 8) return '***';
  return str.substring(0, 3) + '***' + str.substring(str.length - 3);
}
```

### 錯誤追蹤格式

```typescript
interface ErrorLog {
  timestamp: string;
  errorCode: string;           // 參考 ERROR_CODES (IPC 錯誤處理)
  message: string;             // 使用者可讀訊息 (繁體中文)
  technicalMessage: string;    // 技術訊息 (英文)
  stackTrace: string;          // 堆疊追蹤
  userAction: string;          // 使用者最後的操作
  stateSnapshot: {             // 當前狀態快照
    currentStage: string;
    progress: number;
    lastSuccessfulStep: string;
  };
  systemInfo: {
    platform: string;
    appVersion: string;
    electronVersion: string;
    nodeVersion: string;
  };
}

// 範例
function logError(error: Error, context: any) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    errorCode: error.code || 'UNKNOWN',
    message: getLocalizedMessage(error),
    technicalMessage: error.message,
    stackTrace: error.stack || '',
    userAction: context.lastUserAction,
    stateSnapshot: {
      currentStage: projectStore.currentStage,
      progress: uiStore.progress,
      lastSuccessfulStep: context.lastSuccessfulStep
    },
    systemInfo: {
      platform: process.platform,
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node
    }
  };

  // 寫入日誌檔
  logger.error(errorLog);

  // 若為嚴重錯誤，送到錯誤追蹤服務 (如 Sentry)
  if (isCriticalError(error)) {
    sendToErrorTracking(errorLog);
  }
}
```

### 日誌檔案管理

```typescript
const LOG_CONFIG = {
  // 日誌存放位置
  logDir: path.join(app.getPath('userData'), 'logs'),

  // 檔案命名: app-20250129.log
  fileNamePattern: 'app-{date}.log',

  // 保留期限
  maxFiles: 7,              // 保留最近 7 天
  maxFileSize: 10 * 1024 * 1024,  // 單檔最大 10MB

  // 壓縮舊日誌
  compressOldLogs: true     // 超過 1 天的日誌自動壓縮為 .gz
};

// 使用 winston 管理日誌
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // 輸出到檔案 (自動輪替)
    new DailyRotateFile({
      dirname: LOG_CONFIG.logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYYMMDD',
      maxFiles: LOG_CONFIG.maxFiles,
      maxSize: LOG_CONFIG.maxFileSize,
      zippedArchive: LOG_CONFIG.compressOldLogs
    }),

    // 開發環境輸出到 console
    ...(process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console({ format: winston.format.simple() })]
      : []
    )
  ]
});
```

---

## 23. 檔案命名規則

**專案檔案**: `{projectName}.json`
- 範例: `我的影片專案.json`

**音檔**: `{projectName}-audio.mp3`
- 範例: `我的影片專案-audio.mp3`

**圖片檔案**: `para-{段落編號}.png`
- 範例: `para-001.png`, `para-002.png`

**D-ID 影片**: `para-{段落編號}-did.mp4`
- 範例: `para-001-did.mp4`

**最終影片**: `{projectName}-{日期時間}.mp4`
- 範例: `我的影片專案-20250129-143022.mp4`

**備份檔案**: `backup-{YYYYMMDD}-{HHMMSS}.json`
- 範例: `backup-20250129-143022.json`

**目錄結構**:
```
~/Documents/YTMaker3/
├── 我的影片專案/
│   ├── 我的影片專案.json           // 主專案檔案
│   ├── .backups/                    // 備份目錄 (隱藏)
│   │   ├── backup-20250129-143022.json
│   │   └── backup-20250129-144301.json
│   └── output/                      // 輸出目錄
│       ├── 我的影片專案-audio.mp3
│       ├── para-001.png
│       ├── para-002.png
│       ├── para-001-did.mp4
│       └── 我的影片專案-20250129-143022.mp4
└── 另一個專案/
    └── ...
```
