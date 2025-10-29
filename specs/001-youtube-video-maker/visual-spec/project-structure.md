# 專案目錄結構

## 完整目錄樹

```
youtube-maker/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.yml
├── .env.example
├── .gitignore
├── README.md
│
├── src/
│   ├── main/                      # Electron Main Process
│   │   ├── main.ts                # 主程序入口
│   │   ├── ipc/                   # IPC Handlers
│   │   │   ├── fileHandlers.ts    # 檔案系統相關 handlers
│   │   │   ├── ttsHandlers.ts     # Google TTS handlers
│   │   │   ├── geminiHandlers.ts  # Gemini handlers
│   │   │   ├── replicateHandlers.ts # Replicate handlers
│   │   │   ├── didHandlers.ts     # D-ID handlers
│   │   │   ├── ffmpegHandlers.ts  # FFmpeg handlers
│   │   │   ├── youtubeHandlers.ts # YouTube handlers
│   │   │   ├── apiKeyHandlers.ts  # API 金鑰管理 handlers
│   │   │   ├── cacheHandlers.ts   # 快取管理 handlers
│   │   │   └── index.ts           # 統一註冊所有 handlers
│   │   │
│   │   ├── services/              # 後端服務層
│   │   │   ├── TTSService.ts      # Google TTS 服務
│   │   │   ├── GeminiService.ts   # Gemini 服務
│   │   │   ├── ReplicateService.ts # Replicate 服務
│   │   │   ├── DIDService.ts      # D-ID 服務
│   │   │   ├── FFmpegService.ts   # FFmpeg 封裝
│   │   │   ├── YouTubeService.ts  # YouTube API 服務
│   │   │   └── KeychainService.ts # macOS Keychain 服務
│   │   │
│   │   └── utils/
│   │       ├── logger.ts          # 日誌工具
│   │       ├── retry.ts           # 重試機制
│   │       └── concurrentQueue.ts # 並發佇列
│   │
│   ├── preload/                   # Electron Preload Scripts
│   │   ├── preload.ts             # Preload 入口
│   │   └── types.ts               # IPC TypeScript 類型定義
│   │
│   └── renderer/                  # Electron Renderer Process (React App)
│       ├── index.html             # HTML 入口
│       ├── main.tsx               # React 入口
│       ├── App.tsx                # 根元件
│       ├── App.css                # 全域樣式
│       │
│       ├── pages/                 # 頁面元件
│       │   ├── HomePage/
│       │   │   ├── HomePage.tsx
│       │   │   ├── HomePage.module.css
│       │   │   ├── WelcomeDialog.tsx
│       │   │   └── ProjectCard.tsx
│       │   │
│       │   ├── ScriptInputPage/
│       │   │   ├── ScriptInputPage.tsx
│       │   │   ├── ScriptInputPage.module.css
│       │   │   ├── VoiceSelector.tsx
│       │   │   └── ScriptTextarea.tsx
│       │   │
│       │   ├── ScriptEditorPage/
│       │   │   ├── ScriptEditorPage.tsx
│       │   │   ├── ScriptEditorPage.module.css
│       │   │   ├── ParagraphList.tsx
│       │   │   ├── ParagraphEditor.tsx
│       │   │   ├── ImageStyleSelector.tsx
│       │   │   └── DIDSettingsPanel.tsx
│       │   │
│       │   ├── VideoPreviewPage/
│       │   │   ├── VideoPreviewPage.tsx
│       │   │   ├── VideoPreviewPage.module.css
│       │   │   ├── VideoPlayer.tsx
│       │   │   ├── SubtitleEditor.tsx
│       │   │   └── LogoEditor.tsx
│       │   │
│       │   ├── YouTubeUploadPage/
│       │   │   ├── YouTubeUploadPage.tsx
│       │   │   ├── YouTubeUploadPage.module.css
│       │   │   ├── VideoInfoForm.tsx
│       │   │   ├── ThumbnailUploader.tsx
│       │   │   └── ScheduleSettings.tsx
│       │   │
│       │   └── CompletionPage/
│       │       ├── CompletionPage.tsx
│       │       ├── CompletionPage.module.css
│       │       ├── APIUsageTable.tsx
│       │       └── SuccessCard.tsx
│       │
│       ├── components/            # 共用元件
│       │   ├── common/            # Radix UI 包裝元件
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Textarea.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Dialog.tsx
│       │   │   ├── Dropdown.tsx
│       │   │   ├── Tooltip.tsx
│       │   │   ├── Tabs.tsx
│       │   │   ├── Toggle.tsx
│       │   │   ├── Checkbox.tsx
│       │   │   └── index.ts       # 統一匯出
│       │   │
│       │   ├── layout/
│       │   │   ├── PageContainer.tsx
│       │   │   ├── TopNavigation.tsx
│       │   │   └── Sidebar.tsx
│       │   │
│       │   ├── feedback/
│       │   │   ├── Stepper.tsx    # 進度指示器
│       │   │   ├── ProgressCard.tsx # 進度卡片
│       │   │   ├── ProgressBar.tsx
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── ErrorBanner.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   └── Toast.tsx
│       │   │
│       │   └── domain/            # 業務相關元件
│       │       ├── FormField.tsx
│       │       ├── CardListItem.tsx
│       │       └── FilePathInput.tsx
│       │
│       ├── stores/                # Zustand 狀態管理
│       │   ├── projectStore.ts    # 專案狀態
│       │   ├── generationStore.ts # 生成進度狀態
│       │   ├── settingsStore.ts   # 使用者設定
│       │   └── types.ts           # Store 類型定義
│       │
│       ├── services/              # 前端服務層（呼叫 IPC）
│       │   ├── ttsService.ts      # TTS 相關 IPC 呼叫
│       │   ├── geminiService.ts   # Gemini 相關 IPC 呼叫
│       │   ├── replicateService.ts # Replicate 相關 IPC 呼叫
│       │   ├── didService.ts      # D-ID 相關 IPC 呼叫
│       │   ├── ffmpegService.ts   # FFmpeg 相關 IPC 呼叫
│       │   ├── youtubeService.ts  # YouTube 相關 IPC 呼叫
│       │   ├── fileService.ts     # 檔案系統 IPC 呼叫
│       │   ├── apiKeyService.ts   # API 金鑰 IPC 呼叫
│       │   └── cacheService.ts    # 快取 IPC 呼叫
│       │
│       ├── hooks/                 # React Hooks
│       │   ├── useProject.ts      # 專案相關 hooks
│       │   ├── useGeneration.ts   # 生成流程 hooks
│       │   ├── useProgress.ts     # 進度追蹤 hooks
│       │   └── useKeyboardShortcuts.ts # 鍵盤快捷鍵
│       │
│       ├── utils/                 # 前端工具函式
│       │   ├── formatters.ts      # 格式化工具（時間、檔案大小等）
│       │   ├── validators.ts      # 驗證工具
│       │   ├── constants.ts       # 常數定義
│       │   └── helpers.ts         # 通用輔助函式
│       │
│       ├── types/                 # 前端類型定義
│       │   ├── project.ts         # 專案相關類型
│       │   ├── script.ts          # 腳本相關類型
│       │   ├── api.ts             # API 回應類型
│       │   └── global.d.ts        # 全域類型聲明
│       │
│       └── assets/                # 靜態資源
│           ├── icons/             # SVG 圖示
│           ├── images/            # 圖片
│           └── fonts/             # 自訂字型（若需要）
│
├── public/                        # 公開靜態資源
│   ├── icon.png                   # 應用程式圖示
│   └── icon.icns                  # macOS 圖示
│
├── resources/                     # Electron 打包資源
│   ├── icon.png
│   ├── icon.icns
│   └── installer/                 # 安裝程式相關資源
│
├── build/                         # 構建輸出（.gitignore）
│   ├── main/
│   ├── preload/
│   └── renderer/
│
└── dist/                          # 最終打包輸出（.gitignore）
    └── YTMaker3-1.0.0.dmg
```

## 目錄說明

### `/src/main` - Electron 主程序

負責：
- 視窗管理
- IPC 通訊處理
- 呼叫外部 API（Google TTS、Gemini、Replicate 等）
- 檔案系統操作
- macOS Keychain 整合
- FFmpeg 執行

**關鍵檔案**：
- `main.ts` - 應用程式生命週期管理
- `ipc/` - 所有 IPC handlers，對應 `electron-ipc.yaml` 定義
- `services/` - 各 API 的封裝層

### `/src/preload` - Preload Scripts

負責：
- 暴露安全的 API 給 Renderer Process
- 使用 `contextBridge` 橋接 Main 和 Renderer
- 定義 TypeScript 類型

**關鍵檔案**：
- `preload.ts` - 暴露 `window.electronAPI`
- `types.ts` - IPC 相關 TypeScript 類型定義

### `/src/renderer` - React 應用程式

負責：
- UI 渲染
- 使用者互動
- 狀態管理（Zustand）
- 呼叫 IPC API

#### `/src/renderer/pages`

每個頁面一個資料夾，包含：
- 主元件 `XxxPage.tsx`
- 樣式 `XxxPage.module.css`
- 子元件（若需要）

**頁面列表**：
1. `HomePage` - 首頁
2. `ScriptInputPage` - 文稿輸入
3. `ScriptEditorPage` - 腳本編輯
4. `VideoPreviewPage` - 影片預覽編輯
5. `YouTubeUploadPage` - YouTube 上傳
6. `CompletionPage` - 完成頁面

#### `/src/renderer/components`

**分類原則**：
- `common/` - Radix UI 包裝，可在任何專案複用
- `layout/` - 版面佈局元件
- `feedback/` - 回饋元件（進度、錯誤、空狀態等）
- `domain/` - 業務相關元件（特定於本專案）

#### `/src/renderer/stores`

使用 Zustand 管理狀態：

**`projectStore.ts`**
```typescript
interface ProjectStore {
  // 專案基本資訊
  projectId: string | null;
  projectName: string;
  currentStage: Stage;

  // 專案資料
  scriptContent: string;
  settings: ProjectSettings;
  generatedAssets: GeneratedAssets;

  // Actions
  createProject: (name: string) => void;
  loadProject: (path: string) => void;
  saveProject: () => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
}
```

**`generationStore.ts`**
```typescript
interface GenerationStore {
  // 生成進度
  currentTask: string | null;
  progress: number;
  stage: 'tts' | 'gemini' | 'images' | 'did' | 'merge' | null;

  // 錯誤處理
  errors: ErrorInfo[];

  // Actions
  startGeneration: () => void;
  updateProgress: (progress: number) => void;
  addError: (error: ErrorInfo) => void;
}
```

**`settingsStore.ts`**
```typescript
interface SettingsStore {
  // 使用者偏好設定
  defaultOutputPath: string;
  defaultVoice: string;
  defaultImageStyle: string;

  // API 金鑰狀態（不儲存實際金鑰）
  apiKeyStatus: {
    googleTTS: boolean;
    gemini: boolean;
    replicate: boolean;
    did: boolean;
    youtube: boolean;
  };

  // Actions
  updateSettings: (settings: Partial<Settings>) => void;
  checkAPIKeys: () => void;
}
```

#### `/src/renderer/services`

前端服務層，負責呼叫 IPC API：

**範例：`ttsService.ts`**
```typescript
export const ttsService = {
  async generateTTS(text: string, voiceId: string, outputPath: string) {
    return await window.electronAPI.generateTTS({
      text,
      voiceId,
      outputPath
    });
  },

  async listVoices(languageCode: string = 'zh-TW') {
    return await window.electronAPI.listVoices(languageCode);
  }
};
```

## 技術棧

### Main Process
- **Language**: TypeScript
- **Runtime**: Node.js (透過 Electron)
- **Key Libraries**:
  - `axios` - HTTP 請求
  - `fluent-ffmpeg` - FFmpeg 封裝
  - `keytar` - macOS Keychain 存取
  - `googleapis` - Google APIs (TTS, YouTube)

### Renderer Process
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Language**: TypeScript 5.3.0
- **State Management**: Zustand 4.4.0
- **UI Components**: Radix UI
- **Styling**: CSS Modules
- **Routing**: React Router 6.x（若需要）

### Electron
- **Version**: 28.0.0
- **Builder**: electron-builder 24.0.0

## 開發工作流程

### 1. 開發模式
```bash
npm run dev
```
- 同時啟動 Vite Dev Server（Renderer）和 Electron（Main）
- 支援 Hot Module Replacement (HMR)

### 2. 構建
```bash
npm run build
```
- 編譯 TypeScript (Main + Preload + Renderer)
- Vite 打包 Renderer
- 輸出到 `build/` 目錄

### 3. 打包
```bash
npm run package
```
- 使用 electron-builder 打包成 .dmg（macOS）
- 輸出到 `dist/` 目錄

## 檔案命名規範

### React 元件
- **檔案名稱**: PascalCase (e.g., `HomePage.tsx`)
- **元件名稱**: PascalCase (e.g., `HomePage`)
- **樣式檔案**: `{ComponentName}.module.css`

### 非元件檔案
- **檔案名稱**: camelCase (e.g., `projectStore.ts`)
- **常數**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### IPC Handlers
- **檔案名稱**: `{service}Handlers.ts` (e.g., `ttsHandlers.ts`)
- **函式名稱**: `handle{Action}` (e.g., `handleGenerateTTS`)

### Services
- **檔案名稱**: `{Service}Service.ts` (e.g., `TTSService.ts`)
- **類別名稱**: PascalCase (e.g., `TTSService`)

## Import 路徑別名

建議在 `tsconfig.json` 設定：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/renderer/*"],
      "@main/*": ["./src/main/*"],
      "@preload/*": ["./src/preload/*"],
      "@components/*": ["./src/renderer/components/*"],
      "@pages/*": ["./src/renderer/pages/*"],
      "@stores/*": ["./src/renderer/stores/*"],
      "@services/*": ["./src/renderer/services/*"],
      "@utils/*": ["./src/renderer/utils/*"],
      "@types/*": ["./src/renderer/types/*"]
    }
  }
}
```

使用範例：
```typescript
import { Button } from '@components/common';
import { useProject } from '@stores/projectStore';
import { ttsService } from '@services/ttsService';
```

## 環境變數

`.env.example`:
```
# 開發模式
VITE_DEV_MODE=true

# API 端點（若需要）
VITE_API_BASE_URL=https://api.example.com

# 日誌等級
VITE_LOG_LEVEL=debug
```

**注意**：API 金鑰不應該存在 `.env`，而是使用 macOS Keychain 儲存。

## Git 忽略規則

`.gitignore`:
```
# 依賴
node_modules/

# 構建輸出
build/
dist/

# 環境變數
.env
.env.local

# IDE
.vscode/
.idea/

# macOS
.DS_Store

# 日誌
*.log

# 測試專案檔案（開發用）
*.ytmaker.json
```
