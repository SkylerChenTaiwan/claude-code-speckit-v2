# YouTube 影片快速製作工具 - Visual Spec

## 專案資訊

**專案名稱**: YouTube 影片快速製作工具
**功能分支**: 001-youtube-video-maker
**規格版本**: 1.0
**建立日期**: 2025-10-29
**設計風格**: Notion 風格簡潔美學

## 設計理念

本專案採用 **Notion 風格的簡潔設計**:
- 簡潔但精緻的介面
- 最少的顏色使用 (黑灰白為主)
- 補充資訊使用淡灰色呈現
- 避免無意義的裝飾元素
- 重視內容層次和資訊架構

---

## 文件結構

```
visual-spec/
├── README.md                           # 本文件
│
├── 📐 UI 設計規格
│   ├── design-system.md                # 設計系統 (顏色/字型/間距/元件樣式)
│   ├── components/
│   │   └── common-components.md        # 13 個共用 UI 元件規範
│   └── pages/                          # 6 個頁面的完整規格
│       ├── 01-home-page.md
│       ├── 02-script-input-page.md
│       ├── 03-script-editor-page.md
│       ├── 04-video-preview-page.md
│       ├── 05-youtube-upload-page.md
│       └── 06-completion-page.md
│
├── ⚙️ 技術規格
│   ├── TECHNICAL_SPEC.md               # 核心技術規格 (重試/進度/並發/日誌)
│   ├── project-structure.md            # 專案目錄結構與命名規範
│   ├── package.json                    # 完整依賴清單
│   ├── flows/                          # 使用者流程圖
│   │   ├── main-video-creation-flow.md
│   │   ├── batch-creation-flow.md
│   │   └── template-management-flow.md
│   └── services/                       # 服務層程式碼範例
│       └── service-examples.md
│
└── 📡 API 契約
    └── contracts/                      # 所有 API 的 YAML 契約定義
        ├── electron-ipc.yaml           # Electron IPC 通訊協定
        ├── internal-data-contracts.yaml # 內部資料結構
        ├── tts-api.yaml                # Google Text-to-Speech
        ├── gemini-api.yaml             # Google Gemini
        ├── replicate-api.yaml          # Replicate FLUX (圖片生成)
        ├── did-api.yaml                # D-ID (對嘴影片)
        └── youtube-api.yaml            # YouTube Data API
```

---

## 📐 UI 設計規格

### 1. 設計系統 (Design System)
📄 [design-system.md](./design-system.md)

定義完整的設計規範:
- **顏色系統**: 黑灰白配色、狀態顏色
- **字型系統**: macOS 原生字型、大小與行高
- **間距系統**: 4px 基準
- **圓角與陰影**: 一致的視覺風格
- **基礎元件樣式**: 按鈕、輸入框、卡片等

**關鍵顏色**:
```
Primary:         #2E3338 (深灰黑)
Text Primary:    #37352F (深灰)
Text Secondary:  #787774 (中灰)
Text Tertiary:   #9B9A97 (淡灰 - 補充資訊)
Background:      #FFFFFF (純白)
Surface:         #F7F6F3 (米白)
Border:          #E9E9E7 (淡灰邊框)
```

### 2. 共用元件 (Common Components)
📄 [components/common-components.md](./components/common-components.md)

定義 **13 個通用 UI 元件**:
1. 頁面容器 (Page Container)
2. 進度指示器 (Stepper)
3. 輸入框組 (Form Field)
4. 下拉選單 (Dropdown)
5. 卡片列表項 (Card List Item)
6. 進度卡片 (Progress Card)
7. 空狀態提示 (Empty State)
8. 錯誤提示橫幅 (Error Banner)
9. 對話框 (Modal Dialog)
10. 工具提示 (Tooltip)
11. 標籤頁 (Tabs)
12. 切換開關 (Toggle Switch)
13. 複選框 (Checkbox)

每個元件包含:
- ASCII 佈局圖
- 詳細規格 (尺寸、顏色、字型)
- 所有狀態 (預設、hover、focus、disabled)
- 互動行為

### 3. 頁面規格 (Pages)

#### 3.1 首頁 (Home Page)
📄 [pages/01-home-page.md](./pages/01-home-page.md)

- 建立新專案 / 載入既有專案
- 最近專案列表 (最多 3 個)
- 快速動作 (管理範本、清理快取、API 設定)
- 首次啟動歡迎對話框

#### 3.2 文稿輸入頁面 (Script Input)
📄 [pages/02-script-input-page.md](./pages/02-script-input-page.md)

- 輸入/貼上文稿 (最多 10,000 字)
- 即時驗證與預估時長
- 選擇語音 (繁體中文)
- 試聽語音
- 設定輸出位置

#### 3.3 腳本編輯頁面 (Script Editor)
📄 [pages/03-script-editor-page.md](./pages/03-script-editor-page.md)

- 顯示生成的腳本 (段落列表)
- 編輯段落內容、時間、圖片提示詞
- 修改 Gemini system prompt
- 選擇圖片風格 (4 種風格)
- D-ID 對嘴設定 (4 種模式)
- 上傳人像圖片 (若使用 D-ID)

#### 3.4 影片編輯預覽頁面 (Video Preview)
📄 [pages/04-video-preview-page.md](./pages/04-video-preview-page.md)

- 影片預覽窗口 (16:9)
- 字幕編輯器 (位置、字型、顏色)
- Logo 上傳與拖曳定位
- 下載圖片作為縮圖底圖
- 即時預覽調整效果

#### 3.5 YouTube 上傳頁面 (YouTube Upload)
📄 [pages/05-youtube-upload-page.md](./pages/05-youtube-upload-page.md)

- YouTube OAuth 2.0 認證流程
- 選擇頻道
- 填寫影片資訊 (標題、描述、標籤)
- 設定隱私與分類
- 上傳自訂縮圖
- 設定排程發布時間

#### 3.6 完成頁面 (Completion)
📄 [pages/06-completion-page.md](./pages/06-completion-page.md)

- 顯示 YouTube 影片連結
- API 用量統計表格
- 總計費用
- 後續操作 (回首頁、建立新專案)

---

## ⚙️ 技術規格

### 1. 核心技術規格 (Technical Spec)
📄 [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)

包含 **28 個核心技術規格**，涵蓋:

**API 與錯誤處理**:
- D-ID 人像圖片要求
- 影片預覽版 vs 最終版差異
- YouTube 分類列表
- 語音試聽範例文字
- Logo 支援格式
- IPC 錯誤處理標準格式
- **API 重試策略參數** (max retries, backoff multiplier)
- **可重試 vs 不可重試的錯誤碼**

**進度與效能**:
- **進度計算權重分配** (各階段佔比)
- **FFmpeg 進度讀取實作方式**
- **並發控制限制** (圖片生成、D-ID、TTS)
- **API Rate Limiting 參數**

**狀態管理**:
- **狀態同步時機** (auto-save interval: 30s)
- **樂觀更新 + 回滾機制**
- **衝突解決策略**
- **Debounce 儲存**
- 專案備份機制
- Zustand Store Interface

**日誌與除錯**:
- **日誌等級定義** (ERROR/WARN/INFO/DEBUG)
- **敏感資訊脫敏規則** (API Key、檔案路徑、prompt)
- **錯誤追蹤格式** (stack trace、使用者操作、狀態快照)
- **日誌檔案管理** (使用 winston，每日輪替，保留 7 天)

**UI 規格細節**:
- 快取管理對話框
- 範本管理對話框
- 查看全部專案對話框
- 應用程式偏好設定對話框

**API 參數**:
- Google TTS API 完整參數
- Replicate FLUX API 模型版本
- D-ID API Polling 策略

**檔案規範**:
- 檔案命名規則
- 目錄結構範例

### 2. 專案目錄結構 (Project Structure)
📄 [project-structure.md](./project-structure.md)

完整的專案目錄結構說明:
- Electron Main Process (`src/main/`)
- Preload Scripts (`src/preload/`)
- React Renderer Process (`src/renderer/`)
- 目錄分類原則
- 檔案命名規範
- Import 路徑別名設定

**關鍵目錄**:
```
src/main/ipc/          - 所有 IPC Handlers
src/main/services/     - API 服務封裝層
src/renderer/pages/    - 6 個頁面元件
src/renderer/components/ - 共用元件 (common/layout/feedback/domain)
src/renderer/stores/   - Zustand 狀態管理
src/renderer/services/ - 前端服務層 (IPC 呼叫)
```

### 3. 使用者流程 (User Flows)

#### 3.1 主要影片製作流程
📄 [flows/main-video-creation-flow.md](./flows/main-video-creation-flow.md)

**主要影片製作流程**，涵蓋:
1. 應用程式啟動與 API 金鑰檢查
2. 文稿輸入與處理 (TTS + Gemini)
3. 腳本編輯 (編輯、圖片風格、D-ID 設定)
4. 媒體資源生成 (Replicate FLUX + D-ID)
5. 影片編輯與預覽 (字幕、Logo)
6. 影片合成 (FFmpeg)
7. YouTube 上傳 (OAuth + 影片資訊)
8. 完成與 API 用量統計

包含:
- Mermaid 流程圖
- 所有決策點
- 錯誤處理路徑
- 重試機制

**預估時間**:
- 不含對嘴: 10-15 分鐘
- 含對嘴: 12-18 分鐘

#### 3.2 批次製作流程
📄 [flows/batch-creation-flow.md](./flows/batch-creation-flow.md)

**批次製作多個影片**:
- 匯入多個文稿檔案
- 套用範本設定
- 序列處理（一次處理一個）
- 批次上傳到 YouTube

**適用場景**: 製作系列影片（例如教學第 1-10 集）

#### 3.3 範本管理流程
📄 [flows/template-management-flow.md](./flows/template-management-flow.md)

**範本建立與管理**:
- 從當前專案建立範本
- 編輯範本設定
- 刪除範本
- 套用範本到新專案

**範本包含**: 圖片風格、字幕樣式、Logo 設定、D-ID 設定

### 4. API 服務封裝層範例 (Service Examples)
📄 [services/service-examples.md](./services/service-examples.md)

包含 **7 個服務的完整程式碼範例**:
1. `TTSService` - Google Text-to-Speech API
2. `GeminiService` - Google Gemini API
3. `ReplicateService` - Replicate FLUX API (含快取機制)
4. `DIDService` - D-ID API (對嘴影片)
5. `FFmpegService` - FFmpeg 封裝 (影片合成)
6. `YouTubeService` - YouTube Data API (上傳)
7. `KeychainService` - macOS Keychain (金鑰管理)

**工具函式**:
- `retry.ts` - 重試機制
- `concurrentQueue.ts` - 並發佇列控制

### 5. 完整依賴清單 (package.json)
📄 [package.json](./package.json)

**主要依賴**:
- React 18.2.0 + React Router 6.x
- Zustand 4.4.0 (狀態管理)
- Radix UI (UI 元件庫)
- Axios (HTTP 請求)
- fluent-ffmpeg (FFmpeg 封裝)
- keytar (macOS Keychain)
- googleapis (Google APIs)

**開發工具**:
- Electron 28.0.0
- Vite 5.0.0
- TypeScript 5.3.0
- electron-builder 24.0.0

**建置腳本**:
```bash
npm run dev      # 開發模式 (HMR)
npm run build    # 構建
npm run package  # 打包成 .dmg
```

---

## 📡 API 契約

### Electron IPC 通訊協定
📄 [contracts/electron-ipc.yaml](./contracts/electron-ipc.yaml)

定義所有 **Main ↔ Renderer 通訊協定**:
- 檔案系統操作 (讀寫、選擇檔案/資料夾)
- Google TTS API (生成語音、列出語音)
- Gemini API (生成腳本)
- Replicate API (生成圖片、批次生成)
- D-ID API (生成對嘴影片)
- FFmpeg (合成影片、進度事件)
- YouTube API (認證、上傳、進度事件)
- API 金鑰管理 (讀取/儲存/刪除)
- 快取管理 (取得大小、清理)

**TypeScript Interface 範例**:
```typescript
interface ElectronAPI {
  readFile: (path: string) => Promise<{ content?: string; error?: string }>;
  generateTTS: (params: TTSGenerateRequest) => Promise<TTSGenerateResponse>;
  generateScript: (params: GeminiGenerateScriptRequest) => Promise<GeminiGenerateScriptResponse>;
  // ... 完整 API 列表見文件
}
```

### 外部 API 契約

所有外部 API 的完整契約定義 (YAML 格式):

- 📄 [contracts/internal-data-contracts.yaml](./contracts/internal-data-contracts.yaml) - 內部資料結構
- 📄 [contracts/tts-api.yaml](./contracts/tts-api.yaml) - Google Text-to-Speech
- 📄 [contracts/gemini-api.yaml](./contracts/gemini-api.yaml) - Google Gemini
- 📄 [contracts/replicate-api.yaml](./contracts/replicate-api.yaml) - Replicate FLUX
- 📄 [contracts/did-api.yaml](./contracts/did-api.yaml) - D-ID
- 📄 [contracts/youtube-api.yaml](./contracts/youtube-api.yaml) - YouTube Data API

---

## 快速參考

### 設計規範

**顏色**:
```
主要操作: #2E3338
主要文字: #37352F
次要文字: #787774
補充資訊: #9B9A97 ← 淡灰色，用於所有補充說明
背景:     #FFFFFF
卡片背景: #F7F6F3
邊框:     #E9E9E7
```

**間距**:
```
XXS: 4px   XS: 8px   S: 12px   M: 16px
L: 24px    XL: 32px  XXL: 48px
```

**字型大小**:
```
Heading 1:    24px
Heading 2:    20px
Heading 3:    16px
Body Large:   15px
Body Regular: 14px
Body Small:   13px
Caption:      12px ← 補充說明專用
```

**圓角**:
```
Small:  4px  (按鈕、標籤)
Medium: 6px  (輸入框、小卡片)
Large:  8px  (大卡片、彈窗)
XLarge: 12px (對話框)
```

### 技術規範

**API 重試策略**:
```
最多重試: 3 次
首次延遲: 1 秒
延遲倍數: 2 倍 (1s → 2s → 4s)
請求逾時: 30 秒
```

**並發控制**:
```
圖片生成: 最多 3 個並發
D-ID 影片: 最多 2 個並發
TTS 生成: 最多 5 個並發
```

**進度權重** (未使用 D-ID):
```
解析: 1%   音訊: 7%   時間軸: 2%
圖片: 60%  合成: 25%  渲染: 5%
```

**自動儲存**:
```
儲存間隔: 30 秒
Debounce: 1 秒
最長等待: 5 秒必須儲存一次
```

**日誌管理**:
```
保留天數: 7 天
單檔大小: 最大 10MB
壓縮策略: 超過 1 天自動壓縮為 .gz
```

### 鍵盤快捷鍵

```
Cmd+N:     建立新專案
Cmd+O:     載入專案
Cmd+S:     儲存專案
Cmd+Enter: 執行主要操作 (下一步/確認)
Cmd+,:     開啟設定
Esc:       取消/關閉對話框
```

---

## 無障礙要求

- ✅ 所有互動元素支援鍵盤導航
- ✅ Focus 狀態明確可見
- ✅ 顏色對比度 ≥ 4.5:1 (WCAG AA)
- ✅ 錯誤訊息使用 ARIA 屬性
- ✅ 圖片提供 alt 文字

---

## 下一步

完成視覺規格後，下一階段是生成技術設計規格:

```bash
/speckit.plan
```

此指令將基於視覺規格生成 `design-spec.yaml`，包含:
- 技術架構設計
- 資料模型定義
- API 整合細節
- 元件分解
- Work Package 規劃
