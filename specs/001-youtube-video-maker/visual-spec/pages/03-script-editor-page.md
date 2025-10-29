# 腳本編輯頁面 (Script Editor Page)

## 頁面概述

顯示 Gemini 生成的腳本,使用者可編輯段落內容、時間、圖片提示詞,並設定圖片風格和 D-ID 對嘴功能。

## 頁面佈局

```
┌─────────────────────────────────────────────────────────────┐
│  ① 文稿輸入 → ② 腳本編輯 → ③ 影片預覽 → ④ YouTube 上傳     │
│  已完成       進行中       待處理       待處理               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  腳本編輯                                     [儲存專案] [✕]  │
│  編輯腳本內容並設定圖片風格和對嘴功能                        │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────────────┐    │
│  │ 腳本段落 (5)         │ │ 設定                         │    │
│  ├─────────────────────┤ ├─────────────────────────────┤    │
│  │ ✓ 段落 1 (0:00-0:05)│ │ 圖片風格                     │    │
│  │ ✓ 段落 2 (0:05-0:12)│ │ ○ 真實攝影風格               │    │
│  │ ● 段落 3 (0:12-0:18)│ │ ◉ 可愛插畫風格               │    │
│  │ ○ 段落 4 (0:18-0:25)│ │ ○ 中國古典風格               │    │
│  │ ○ 段落 5 (0:25-0:30)│ │ ○ 兒童繪本風格               │    │
│  └─────────────────────┘ │                              │    │
│                           │ D-ID 對嘴設定                │    │
│  ┌─────────────────────────────────────┐                │    │
│  │ 段落 3 (0:12 - 0:18) 時長 6 秒    ▲ │                │    │
│  ├─────────────────────────────────────┤                │    │
│  │                                     │                │    │
│  │ 段落文字                            │                │    │
│  │ ┌─────────────────────────────────┐ │                │    │
│  │ │ 這是第三段的內容,說明產品特色...  │ │                │    │
│  │ │                                 │ │                │    │
│  │ └─────────────────────────────────┘ │                │    │
│  │                                     │                │    │
│  │ 圖片提示詞 (中文,供參考)             │ │ ○ 不使用對嘴     │    │
│  │ 產品特寫照,白色背景                 │ │ ◉ 僅片頭使用     │    │
│  │                                     │ │ ○ 僅片尾使用     │    │
│  │ 圖片提示詞 (實際使用,英文)           │ │ ○ 片頭片尾都用   │    │
│  │ ┌─────────────────────────────────┐ │ │                  │    │
│  │ │ Close-up of product, white ba.. │ │ │ 人像圖片          │    │
│  │ └─────────────────────────────────┘ │ │ [上傳圖片]        │    │
│  │                                     │ │                  │    │
│  │ 時間設定                            │ │                  │    │
│  │ 開始 [0:12] 結束 [0:18]            │ └──────────────────┘    │
│  │                                     ▼                       │
│  └─────────────────────────────────────┘                       │
│                                                               │
│                                          [取消] [生成媒體 →]   │
└─────────────────────────────────────────────────────────────┘
```

## 元件規格

### 1. 進度指示器
- 使用共用元件 Stepper
- 目前步驟: ② 腳本編輯 (進行中)
- 總共 4 個步驟

### 2. 頁面標題區
```
內邊距: 32px
```

**標題**
- 文字: "腳本編輯"
- 字型: Heading 1 (24px, #37352F)
- 字重: 600

**說明**
- 文字: "編輯腳本內容並設定圖片風格和對嘴功能"
- 字型: Body Regular (14px, #9B9A97)
- 上方間距: 8px

**右側按鈕**
- [儲存專案]: Secondary Button
- [✕ 關閉]: Text Button,返回首頁

### 3. 主要內容區 (雙欄佈局)

**佈局**
```
左欄: 寬度 60% (腳本段落列表 + 編輯器)
右欄: 寬度 40% (設定面板)
間距: 24px
```

### 4. 左欄 - 腳本段落列表

**標題**
- 文字: "腳本段落 ({總數})"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**段落列表容器**
```
高度: 240px
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 8px
內邊距: 8px
溢位: 垂直捲動
陰影: Card
```

**段落列表項**
```
高度: 44px
內邊距: 8px 12px
圓角: 4px
佈局: 水平 (圖示 + 文字)
間距: 8px

預設:
  背景: transparent

Hover:
  背景: #F7F6F3

已選擇:
  背景: #EFEFED
  邊框: 1px solid #D3D1CB
```

**狀態圖示**
- ✓ (已生成): #0F7B6C (綠色)
- ● (目前選擇): #2E3338 (深灰)
- ○ (未生成): #C7C7C5 (淡灰)

**段落標題**
- 格式: "段落 {編號} ({開始時間}-{結束時間})"
- 範例: "段落 1 (0:00-0:05)"
- 字型: Body Regular (14px, #37352F)

**時間格式**
- 格式: M:SS 或 MM:SS
- 範例: 0:00, 0:05, 1:30

### 5. 左欄 - 段落編輯器

**容器**
```
上方間距: 24px
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 8px
內邊距: 24px
陰影: Card
```

**標題列**
```
高度: 40px
邊框底部: 1px solid #EFEFED
內邊距底: 12px
```

**標題**
- 格式: "段落 {編號} ({開始時間} - {結束時間}) 時長 {秒數} 秒"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**捲動按鈕**
- 位置: 標題列右側
- 圖示: ▲ ▼
- 功能: 快速切換上/下一個段落

**段落文字輸入區**
```
上方間距: 20px
```

**標籤**
- 文字: "段落文字"
- 字型: Body Regular (14px, #37352F)
- 字重: 500

**文字輸入框 (Textarea)**
```
上方間距: 8px
寬度: 100%
最小高度: 80px
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 6px
內邊距: 12px
字型: Body Regular (14px, #37352F)
行高: 1.6
可調整大小: 垂直

Focus:
  邊框: 1px solid #2E3338
```

**圖片提示詞 (中文,供參考)**
```
上方間距: 20px
```

**標籤**
- 文字: "圖片提示詞 (中文,供參考)"
- 字型: Body Small (13px, #787774)

**顯示內容**
```
上方間距: 6px
字型: Body Regular (14px, #9B9A97)
字重: 400
```

**圖片提示詞 (實際使用,英文)**
```
上方間距: 16px
```

**標籤**
- 文字: "圖片提示詞 (實際使用,英文)"
- 字型: Body Regular (14px, #37352F)
- 字重: 500

**文字輸入框 (Textarea)**
```
上方間距: 8px
寬度: 100%
最小高度: 60px
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 6px
內邊距: 12px
字型: Body Small (13px, #37352F)
行高: 1.5
可調整大小: 垂直
```

**時間設定**
```
上方間距: 20px
佈局: 水平 (標籤 + 輸入框)
間距: 12px
```

**標籤**
- 文字: "時間設定"
- 字型: Body Regular (14px, #37352F)
- 字重: 500

**開始時間輸入框**
```
標籤: "開始"
寬度: 80px
高度: 36px
格式: M:SS
佔位符: "0:00"
字型: Body Small (13px, Monospace)
```

**結束時間輸入框**
```
標籤: "結束"
寬度: 80px
高度: 36px
格式: M:SS
佔位符: "0:00"
字型: Body Small (13px, Monospace)
```

### 6. 右欄 - 設定面板

**容器**
```
背景: #FFFFFF
邊框: 1px solid #E9E9E7
圓角: 8px
內邊距: 24px
陰影: Card
```

**圖片風格選擇**

**標題**
- 文字: "圖片風格"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**單選按鈕組**
```
上方間距: 16px
間距: 12px (垂直)
```

**每個選項**
```
高度: 36px
佈局: 水平 (單選鈕 + 標籤)
間距: 8px
```

**選項列表**:
- ○ 真實攝影風格 (realistic)
- ○ 可愛插畫風格 (cute-illustration)
- ○ 中國古典風格 (chinese-classic)
- ○ 兒童繪本風格 (children)

**圖片風格提示詞範本**

每個風格會在 Gemini 生成的圖片提示詞前後加上特定的風格修飾詞,以確保生成圖片符合選擇的風格。

完整的圖片生成提示詞格式:
```
{風格前綴} {Gemini 生成的提示詞} {風格後綴}
```

**1. 真實攝影風格 (realistic)**

```typescript
const realisticStyle = {
  prefix: "",
  suffix: "photorealistic, high quality photography, professional DSLR camera, 8k resolution, ultra detailed, natural lighting, sharp focus, realistic textures, cinematic composition",
  negativePrompt: "illustration, cartoon, anime, painting, drawing, sketch, low quality, blurry, distorted, artificial"
};
```

**適用場景**:
- 新聞、教育、科普類影片
- 需要真實感的內容
- 商品展示、人物訪談

**生成範例**:
```
原始提示詞: "A modern office with computers and plants"
最終提示詞: "A modern office with computers and plants, photorealistic, high quality photography, professional DSLR camera, 8k resolution, ultra detailed, natural lighting, sharp focus, realistic textures, cinematic composition"
負面提示詞: "illustration, cartoon, anime, painting, drawing, sketch, low quality, blurry, distorted, artificial"
```

**2. 可愛插畫風格 (cute-illustration)**

```typescript
const cuteIllustrationStyle = {
  prefix: "cute kawaii style,",
  suffix: "pastel colors, soft gradients, hand-drawn illustration, charming characters, rounded shapes, playful composition, clean lines, digital art, adorable aesthetic, warm and cheerful atmosphere",
  negativePrompt: "photorealistic, dark colors, horror, scary, aggressive, violent, realistic photography"
};
```

**適用場景**:
- 兒童教育、親子內容
- 生活風格、溫馨故事
- 品牌行銷 (年輕、友善形象)

**生成範例**:
```
原始提示詞: "A cat playing with a ball of yarn"
最終提示詞: "cute kawaii style, A cat playing with a ball of yarn, pastel colors, soft gradients, hand-drawn illustration, charming characters, rounded shapes, playful composition, clean lines, digital art, adorable aesthetic, warm and cheerful atmosphere"
負面提示詞: "photorealistic, dark colors, horror, scary, aggressive, violent, realistic photography"
```

**3. 中國古典風格 (chinese-classic)**

```typescript
const chineseClassicStyle = {
  prefix: "traditional Chinese painting style, ink wash painting,",
  suffix: "classical Chinese art, mountains and rivers, elegant composition, poetic atmosphere, soft brushstrokes, muted colors, beige and grey tones, minimalist aesthetic, ancient Chinese aesthetics, serene and tranquil mood, inspired by Song and Yuan dynasty paintings",
  negativePrompt: "modern, western style, bright neon colors, photorealistic, 3D rendering, cartoon"
};
```

**適用場景**:
- 文化、歷史、古典文學內容
- 詩詞、國學、傳統故事
- 藝術、美學、禪意主題

**生成範例**:
```
原始提示詞: "A scholar reading under a willow tree"
最終提示詞: "traditional Chinese painting style, ink wash painting, A scholar reading under a willow tree, classical Chinese art, mountains and rivers, elegant composition, poetic atmosphere, soft brushstrokes, muted colors, beige and grey tones, minimalist aesthetic, ancient Chinese aesthetics, serene and tranquil mood, inspired by Song and Yuan dynasty paintings"
負面提示詞: "modern, western style, bright neon colors, photorealistic, 3D rendering, cartoon"
```

**4. 兒童繪本風格 (children)**

```typescript
const childrenStyle = {
  prefix: "children's book illustration style,",
  suffix: "bright and vibrant colors, simple shapes, friendly characters, clear composition, playful and joyful atmosphere, bold outlines, easy to understand visual storytelling, warm and inviting, suitable for young children, professional picture book quality",
  negativePrompt: "dark, scary, complex details, photorealistic, abstract, violent, sad"
};
```

**適用場景**:
- 幼兒教育、兒童故事
- 學前啟蒙、品格教育
- 童話、寓言故事

**生成範例**:
```
原始提示詞: "A friendly dragon helping children cross a river"
最終提示詞: "children's book illustration style, A friendly dragon helping children cross a river, bright and vibrant colors, simple shapes, friendly characters, clear composition, playful and joyful atmosphere, bold outlines, easy to understand visual storytelling, warm and inviting, suitable for young children, professional picture book quality"
負面提示詞: "dark, scary, complex details, photorealistic, abstract, violent, sad"
```

**實作細節**

在呼叫 Replicate FLUX API 時的組合邏輯:

```typescript
interface ImageGenerationRequest {
  prompt: string;
  selectedStyle: 'realistic' | 'cute-illustration' | 'chinese-classic' | 'children';
}

function buildFinalPrompt(request: ImageGenerationRequest, geminiPrompt: string): string {
  const styles = {
    'realistic': realisticStyle,
    'cute-illustration': cuteIllustrationStyle,
    'chinese-classic': chineseClassicStyle,
    'children': childrenStyle
  };

  const style = styles[request.selectedStyle];

  // 組合最終提示詞
  const prefix = style.prefix ? `${style.prefix} ` : '';
  const suffix = style.suffix ? `, ${style.suffix}` : '';

  return `${prefix}${geminiPrompt}${suffix}`;
}

// Replicate API 呼叫範例
const replicateRequest = {
  model: "black-forest-labs/flux-schnell",
  input: {
    prompt: buildFinalPrompt(request, geminiPrompt),
    negative_prompt: style.negativePrompt,
    width: 1920,
    height: 1080,
    num_inference_steps: 4,
    guidance_scale: 0  // FLUX Schnell 不需要 guidance
  }
};
```

**風格選擇的預設值**

- 首次使用: 預設選擇「真實攝影風格 (realistic)」
- 儲存在專案檔案中,下次載入專案時沿用上次選擇
- 可在「設定」中設定全域預設風格

**單選按鈕樣式**
```
寬度: 18px
高度: 18px
邊框: 1.5px solid #E9E9E7
圓形: 50%

已選擇:
  邊框: 1.5px solid #2E3338
  內圈: 6px 圓形,填滿 #2E3338
```

**標籤**
- 字型: Body Regular (14px, #37352F)

**分隔線**
```
上方間距: 24px
下方間距: 24px
高度: 1px
背景: #EFEFED
```

**D-ID 對嘴設定**

**標題**
- 文字: "D-ID 對嘴設定"
- 字型: Heading 3 (16px, #37352F)
- 字重: 600

**單選按鈕組**
```
上方間距: 16px
間距: 12px (垂直)
```

**選項列表**:
- ○ 不使用對嘴 (none)
- ○ 僅片頭使用 (opening-only)
- ○ 僅片尾使用 (ending-only)
- ○ 片頭片尾都用 (both)

**人像圖片上傳**
```
上方間距: 20px
顯示條件: 當選擇「僅片頭」、「僅片尾」或「片頭片尾都用」
```

**標籤**
- 文字: "人像圖片"
- 字型: Body Regular (14px, #37352F)
- 字重: 500

**上傳按鈕**
```
上方間距: 8px
樣式: Secondary Button
文字: "上傳圖片"
寬度: 100%
```

**圖片預覽 (已上傳時)**
```
上方間距: 12px
寬度: 100%
高度: 200px (保持比例)
圓角: 6px
邊框: 1px solid #E9E9E7
物件適配: cover
```

**圖片要求說明**
```
上方間距: 8px
字型: Caption (12px, #9B9A97)
```

說明文字:
```
建議使用清晰的正面人像照片
支援格式: PNG, JPG
最大檔案大小: 5MB
```

### 7. 底部按鈕列

**佈局**
```
位置: 固定於頁面底部
高度: 80px
背景: #FFFFFF
上邊框: 1px solid #E9E9E7
內邊距: 20px 32px
對齊: 右側
```

**[取消] 按鈕**
- 樣式: Secondary Button
- 點擊: 顯示確認對話框

**[生成媒體 →] 按鈕**
- 樣式: Primary Button
- Icon: → (右側)
- 點擊: 執行媒體資源生成

## 互動行為

### 初始載入

**顯示生成的腳本**:
1. 從 Gemini API 回應中解析 JSON
2. 載入所有段落到列表
3. 自動選擇第一個段落
4. 在編輯器中顯示第一段內容
5. 預設圖片風格: realistic
6. 預設 D-ID 設定: none

### 段落切換

**點擊段落列表項**:
1. 儲存目前段落的編輯內容
2. 更新選擇狀態
3. 在編輯器中載入該段落內容
4. 捲動列表確保選中項可見

**使用 ▲ ▼ 按鈕**:
- ▲: 切換到上一個段落 (若存在)
- ▼: 切換到下一個段落 (若存在)

**鍵盤快捷鍵**:
- ↑: 上一個段落
- ↓: 下一個段落

### 內容編輯

**段落文字編輯**:
- 即時儲存 (debounce 1000ms)
- 更新專案檔案中的 scriptData

**圖片提示詞編輯**:
- 只能編輯英文提示詞
- 即時儲存 (debounce 1000ms)
- 中文提示詞為唯讀 (Gemini 生成)

**時間編輯**:
- 驗證時間格式 (M:SS 或 MM:SS)
- 驗證開始時間 < 結束時間
- 驗證不與其他段落重疊
- 錯誤時顯示紅色邊框和錯誤訊息

### 圖片風格選擇

**選擇風格**:
1. 單選按鈕選擇
2. 更新專案設定中的 imageStyle
3. 自動儲存專案
4. 顯示提示: "圖片風格已更新為 {風格名稱}"

### D-ID 對嘴設定

**選擇「不使用對嘴」**:
- 隱藏人像圖片上傳區域

**選擇其他選項**:
1. 顯示人像圖片上傳區域
2. 若未上傳圖片,在生成時顯示警告

**上傳人像圖片**:
1. 點擊「上傳圖片」按鈕
2. 開啟檔案選擇器 (篩選 PNG, JPG)
3. 驗證檔案:
   - 檔案大小 ≤ 5MB
   - 格式為 PNG 或 JPG
4. 複製圖片到專案輸出目錄
5. 顯示圖片預覽
6. 儲存圖片路徑到專案設定

**移除圖片**:
- 圖片預覽右上角顯示 [✕] 按鈕
- 點擊後移除圖片和預覽

### 生成媒體流程

**點擊「生成媒體」按鈕後**:

1. **驗證檢查**:
   - 所有段落的英文提示詞不為空
   - 若使用 D-ID 且未上傳人像 → 顯示錯誤
   - 時間設定無重疊和錯誤

2. **顯示進度對話框**:
   ```
   ┌──────────────────────────────────────────────┐
   │  正在生成媒體資源...                          │
   │  ████████████░░░░░░░░░░░░░░░░░░░░ 0%         │
   │                                              │
   │  • 正在生成圖片 1/5... (Replicate)           │
   └──────────────────────────────────────────────┘
   ```

3. **圖片生成** (並行呼叫 Replicate FLUX API):
   - 顯示: "正在生成圖片 {n}/{總數}... (Replicate)"
   - 每個段落生成一張圖片
   - 根據選擇的風格組合完整提示詞
   - 進度: 0% → 70%

4. **D-ID 對嘴影片生成** (若啟用):
   - 顯示: "正在生成對嘴影片... (D-ID)"
   - 根據設定生成片頭/片尾對嘴影片
   - 進度: 70% → 100%

5. **處理完成**:
   - 關閉進度對話框
   - 顯示成功提示: "媒體資源生成完成"
   - 跳轉到「影片編輯預覽頁面」

## 錯誤處理

### 驗證錯誤

**圖片提示詞為空**:
```
錯誤訊息: "段落 {編號} 的圖片提示詞不能為空"
說明: "請為所有段落填寫英文圖片提示詞"
操作: [前往該段落]
```

**未上傳人像圖片**:
```
錯誤訊息: "未上傳人像圖片"
說明: "啟用 D-ID 對嘴功能需要上傳人像照片"
操作: [上傳圖片] [取消]
```

**時間重疊錯誤**:
```
錯誤訊息: "段落 {編號} 與段落 {編號} 時間重疊"
說明: "請調整段落時間範圍"
操作: [前往該段落]
```

### API 錯誤

**Replicate 圖片生成失敗**:
```
錯誤訊息: "圖片生成失敗 (段落 {編號})"
說明: "請檢查提示詞和網路連線後重試"
操作: [重試] [跳過此段落] [取消全部]
```

**圖片生成失敗的重試策略詳細規格**

**自動重試邏輯**

當圖片生成失敗時，系統會自動執行最多 2 次重試（總共 3 次嘗試）：

```typescript
interface RetryConfig {
  maxRetries: 2;              // 最多重試 2 次
  retryDelay: 3000;           // 重試間隔 3 秒
  retryDelayMultiplier: 1.5;  // 每次重試延長 1.5 倍 (3s → 4.5s)
  modifyPromptOnRetry: true;  // 重試時修改提示詞
}
```

**重試流程**

1. **第一次嘗試失敗**:
   - 等待 3 秒
   - 在進度對話框顯示: "生成失敗，正在重試... (1/2)"
   - 使用原始提示詞 + 變化修飾詞重試

2. **第二次嘗試失敗**:
   - 等待 4.5 秒
   - 顯示: "生成失敗，正在重試... (2/2)"
   - 使用替代提示詞策略重試

3. **第三次嘗試仍失敗**:
   - 停止自動重試
   - 顯示錯誤對話框，讓使用者選擇下一步行動

**提示詞修改策略（重試時）**

**第一次重試（嘗試 2/3）**：加入變化修飾詞

```typescript
function modifyPromptForFirstRetry(originalPrompt: string): string {
  // 在原提示詞加入 "alternative view" 或 "different perspective"
  const variations = [
    "alternative composition",
    "different angle",
    "alternative perspective",
    "slightly different view"
  ];

  const randomVariation = variations[Math.floor(Math.random() * variations.length)];

  return `${originalPrompt}, ${randomVariation}`;
}
```

**範例**：
- 原始: "A modern office with computers and plants"
- 重試 1: "A modern office with computers and plants, alternative composition"

**第二次重試（嘗試 3/3）**：簡化提示詞

```typescript
function modifyPromptForSecondRetry(originalPrompt: string): string {
  // 策略 1: 移除修飾詞，保留核心概念
  // 策略 2: 使用更通用的描述

  // 簡單的實作：提取前半部分（主要主題）
  const words = originalPrompt.split(',');
  const corePrompt = words.slice(0, 2).join(','); // 保留前兩個主要描述

  return `${corePrompt}, high quality, detailed`;
}
```

**範例**：
- 原始: "A modern office with computers and plants, bright natural lighting, professional photography, 8k"
- 重試 2: "A modern office with computers, high quality, detailed"

**常見錯誤類型及處理**

**1. API 限流錯誤 (429 Too Many Requests)**
- 重試間隔: 10 秒（較長）
- 提示訊息: "API 請求過於頻繁，等待 10 秒後重試..."
- 不修改提示詞

**2. 內容政策違規 (400 Content Policy)**
- 不自動重試
- 直接顯示錯誤: "圖片提示詞違反內容政策"
- 建議: "請修改提示詞，移除可能不適當的內容"
- 操作: [編輯提示詞] [跳過此段落]

**3. 網路逾時 (Timeout)**
- 正常重試流程
- 延長重試間隔至 5 秒
- 提示訊息: "網路連線逾時，正在重試..."

**4. API 金鑰無效 (401 Unauthorized)**
- 不重試
- 顯示錯誤: "Replicate API 金鑰無效或已過期"
- 操作: [前往設定] [取消]

**5. 伺服器錯誤 (500 Internal Server Error)**
- 正常重試流程
- 提示訊息: "伺服器暫時無法回應，正在重試..."

**使用者手動重試**

當自動重試全部失敗後，使用者可以選擇：

**選項 1: [重試]**
- 使用原始提示詞重新生成
- 重新啟動完整的重試流程（最多 3 次嘗試）
- 建議使用者先檢查網路連線和提示詞內容

**選項 2: [跳過此段落]**
- 標記該段落為「圖片缺失」
- 繼續生成其他段落的圖片
- 在預覽時該段落顯示佔位圖（灰色背景 + "圖片缺失" 文字）
- 使用者可稍後回到腳本編輯頁面重新生成

**選項 3: [修改提示詞後重試]**
- 開啟該段落的提示詞編輯對話框
- 使用者手動修改提示詞
- 修改後立即重試生成
- 繞過自動重試次數限制

**選項 4: [取消全部]**
- 停止所有圖片生成
- 返回腳本編輯頁面
- 已生成的圖片保留

**跳過後的處理**

當使用者跳過某個段落的圖片生成：

1. **在專案檔案中標記**:
```typescript
interface Paragraph {
  paragraphId: string;
  text: string;
  imagePrompt: string;
  imagePath?: string;
  imageStatus: 'pending' | 'generating' | 'completed' | 'failed' | 'skipped';
  imageError?: string;  // 記錄失敗原因
}
```

2. **在腳本編輯頁面顯示警告**:
```
⚠️  段落 3 的圖片生成失敗，已跳過
[重新生成] [上傳自訂圖片]
```

3. **在影片預覽時的替代方案**:
   - 顯示黑色背景 + 白色文字「圖片載入中...」
   - 或使用 AI 生成的佔位圖案
   - 不影響影片合成，但會在預覽時顯示警告

**重試計數和狀態追蹤**

```typescript
interface ImageGenerationAttempt {
  paragraphId: string;
  prompt: string;
  attemptNumber: number;  // 1, 2, or 3
  timestamp: number;
  error?: string;
  success: boolean;
}

// 在 state 中追蹤
interface EditorState {
  imageGenerationAttempts: Map<string, ImageGenerationAttempt[]>;
  failedParagraphs: string[];  // 記錄失敗的段落 ID
}
```

**重試時的使用者體驗**

進度對話框顯示範例：

```
┌────────────────────────────────────────────┐
│  正在生成圖片...                           │
├────────────────────────────────────────────┤
│  ████████████████░░░░░░░░░░░░ 60%          │
│                                            │
│  • 段落 1: ✅ 已完成                       │
│  • 段落 2: ✅ 已完成                       │
│  • 段落 3: 🔄 生成失敗，正在重試 (1/2)... │
│  • 段落 4: ⏳ 等待中                       │
│  • 段落 5: ⏳ 等待中                       │
│                                            │
│  預計剩餘時間: 2 分鐘                      │
└────────────────────────────────────────────┘
```

**最佳實踐建議**

在 UI 中顯示給使用者的提示：

- ✅ 建議使用具體、清晰的提示詞
- ✅ 避免使用過於抽象的概念
- ✅ 確保提示詞符合內容政策
- ✅ 網路不穩定時可選擇稍後重試

**D-ID 對嘴影片生成失敗**:
```
錯誤訊息: "對嘴影片生成失敗"
說明: "請檢查人像圖片品質和網路連線後重試"
操作: [重試] [繼續不使用對嘴] [取消]
```

## 鍵盤快捷鍵

```
Cmd+S: 儲存專案
Cmd+Enter: 生成媒體 (若驗證通過)
↑: 上一個段落
↓: 下一個段落
Esc: 取消
```

## 無障礙

- 段落列表支援鍵盤方向鍵導航
- 單選按鈕支援 Tab 和 Space 鍵
- 所有輸入框支援鍵盤導航
- Focus 樣式清晰可見
- 錯誤訊息使用 ARIA 屬性
