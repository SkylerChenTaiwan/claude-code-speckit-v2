# 技術架構決策 (Technical Architecture Decision)

**專案**: YouTube 影片快速製作工具
**版本**: 1.0
**日期**: 2025-10-29

---

## 1. 前端技術棧

### 1.1 應用類型決策

**選擇**: **Electron (桌面應用)**

**原因**:
- ✅ 需要本地檔案系統存取 (讀寫專案檔、影片檔案)
- ✅ 需要呼叫本地命令列工具 (FFmpeg)
- ✅ 需要讀寫本地 Keychain (儲存 API 金鑰)
- ✅ 長時間運行的任務 (影片合成) 不適合在瀏覽器執行
- ✅ 目標用戶是 macOS 內容創作者 (桌面應用符合需求)

**替代方案 (被拒絕)**:
- ❌ Web 應用 - 檔案系統權限受限,無法呼叫 FFmpeg
- ❌ Tauri - 生態系較新,Electron 更成熟穩定

---

### 1.2 前端框架

**選擇**: **React 18 + TypeScript**

**原因**:
- ✅ 豐富的生態系 (Electron + React 最成熟)
- ✅ 類型安全 (TypeScript 減少執行時錯誤)
- ✅ Hooks 適合管理複雜狀態
- ✅ React DevTools 方便除錯

**版本**:
- React: `18.2.0`
- TypeScript: `5.3.0`

---

### 1.3 狀態管理

**選擇**: **Zustand**

**原因**:
- ✅ 輕量 (2KB gzipped)
- ✅ 無需 Provider 包裹
- ✅ TypeScript 支援優秀
- ✅ 適合中小型應用 (本專案頁面數不多)
- ✅ 簡單直覺的 API

**替代方案 (被拒絕)**:
- ❌ Redux - 過於笨重,boilerplate 太多
- ❌ MobX - 學習曲線較陡
- ❌ Context API - 效能問題 (全局 re-render)

**Store 結構**:
```typescript
// src/stores/projectStore.ts
interface ProjectStore {
  currentProject: Project | null;
  recentProjects: Project[];
  setCurrentProject: (project: Project) => void;
  addRecentProject: (project: Project) => void;
}

// src/stores/generationStore.ts
interface GenerationStore {
  script: ScriptSegment[];
  audioFile: string | null;
  images: GeneratedImage[];
  videoFile: string | null;
  progress: GenerationProgress;
  updateProgress: (phase: string, percent: number) => void;
}

// src/stores/settingsStore.ts
interface SettingsStore {
  apiKeys: ApiKeys;
  preferences: UserPreferences;
  setApiKey: (service: string, key: string) => void;
}
```

---

### 1.4 路由方案

**選擇**: **React Router v6**

**原因**:
- ✅ Electron 單視窗應用 (不需要多視窗管理)
- ✅ 成熟穩定,文件豐富
- ✅ 支援 Nested Routes (適合 Layout 共用)

**路由結構**:
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/script-input" element={<ScriptInputPage />} />
  <Route path="/script-editor" element={<ScriptEditorPage />} />
  <Route path="/video-preview" element={<VideoPreviewPage />} />
  <Route path="/youtube-upload" element={<YouTubeUploadPage />} />
  <Route path="/completion" element={<CompletionPage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Routes>
```

---

### 1.5 UI 元件庫

**選擇**: **Radix UI (Headless) + 自定義樣式**

**原因**:
- ✅ Headless 元件 (完全控制樣式)
- ✅ 無障礙支援優秀 (ARIA 屬性自動處理)
- ✅ 鍵盤導航支援
- ✅ 適合 Notion 風格的簡潔設計

**使用的 Radix 元件**:
- `@radix-ui/react-dialog` (Modal 對話框)
- `@radix-ui/react-dropdown-menu` (下拉選單)
- `@radix-ui/react-switch` (Toggle 開關)
- `@radix-ui/react-checkbox` (複選框)
- `@radix-ui/react-tabs` (標籤頁)
- `@radix-ui/react-tooltip` (工具提示)
- `@radix-ui/react-progress` (進度條)

**替代方案 (被拒絕)**:
- ❌ Material-UI - 樣式過於 Material Design,不符合 Notion 風格
- ❌ Ant Design - 中國風格,顏色過於鮮豔
- ❌ Chakra UI - 預設樣式不易覆蓋

---

### 1.6 樣式方案

**選擇**: **Tailwind CSS**

**原因**:
- ✅ 快速開發 (Utility-first)
- ✅ 無需命名 class (避免命名疲勞)
- ✅ Tree-shaking (未使用的樣式不會打包)
- ✅ 與 Radix UI 搭配良好

**Tailwind 設定檔** (`tailwind.config.js`):
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2E3338',
        'text-primary': '#37352F',
        'text-secondary': '#787774',
        'text-tertiary': '#9B9A97',
        'bg-primary': '#FFFFFF',
        'bg-surface': '#F7F6F3',
        'border-default': '#E9E9E7',
        'error': '#E03E3E',
        'warning': '#FFC94D',
        'success': '#0F7B6C',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        's': '12px',
        'm': '16px',
        'l': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
    },
  },
  plugins: [],
};
```

---

### 1.7 建構工具

**選擇**: **Vite**

**原因**:
- ✅ 極快的冷啟動 (基於 ESM)
- ✅ 熱模組替換 (HMR) 快速
- ✅ Electron + Vite 生態成熟 (`vite-plugin-electron`)
- ✅ TypeScript 支援良好

**建構配置** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron'],
    },
  },
});
```

---

## 2. 後端/本地架構

### 2.1 Electron 架構

**選擇**: **Main Process + Renderer Process + Preload Script**

**Main Process (Node.js 環境)**:
- 負責系統 API 互動 (檔案讀寫、FFmpeg 呼叫、Keychain 存取)
- 管理視窗生命週期
- 處理 IPC 通訊

**Renderer Process (瀏覽器環境)**:
- React 應用執行環境
- 透過 IPC 與 Main Process 通訊

**Preload Script**:
- 安全橋接 Main 和 Renderer
- 暴露受限的 API 給 Renderer

**檔案結構**:
```
src/
├── main/                     # Main Process
│   ├── main.ts               # 主程序進入點
│   ├── ipc-handlers.ts       # IPC 處理器
│   ├── ffmpeg.ts             # FFmpeg 封裝
│   ├── keychain.ts           # Keychain 存取
│   └── file-system.ts        # 檔案系統操作
├── preload/
│   └── preload.ts            # Preload Script (IPC Bridge)
└── renderer/                 # Renderer Process (React App)
    ├── App.tsx
    ├── pages/
    ├── components/
    └── stores/
```

---

### 2.2 FFmpeg 整合

**選擇**: **Static FFmpeg Binary (隨應用打包)**

**原因**:
- ✅ 避免依賴用戶系統安裝 (更好的用戶體驗)
- ✅ 版本可控 (避免 FFmpeg 版本差異導致問題)
- ✅ 應用體積增加可接受 (約 60MB)

**FFmpeg 位置**:
```
app/
└── resources/
    └── bin/
        └── ffmpeg-macos-arm64  # macOS Apple Silicon
```

**封裝層** (`src/main/ffmpeg.ts`):
```typescript
import { spawn } from 'child_process';
import path from 'path';
import { app } from 'electron';

export class FFmpegService {
  private ffmpegPath: string;

  constructor() {
    this.ffmpegPath = path.join(
      app.getAppPath(),
      'resources',
      'bin',
      'ffmpeg-macos-arm64'
    );
  }

  async mergeAudioImage(
    audioPath: string,
    imagePath: string,
    outputPath: string,
    onProgress: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, [
        '-i', imagePath,
        '-i', audioPath,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-shortest',
        '-pix_fmt', 'yuv420p',
        '-progress', 'pipe:1',
        outputPath,
      ]);

      ffmpeg.stdout.on('data', (data) => {
        // 解析進度輸出
        const progress = this.parseProgress(data.toString());
        onProgress(progress);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  }

  private parseProgress(output: string): number {
    // 解析 FFmpeg progress 輸出
    const match = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, hours, minutes, seconds] = match;
      const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      return totalSeconds; // 需要配合音訊總長度計算百分比
    }
    return 0;
  }

  async addSubtitles(
    videoPath: string,
    srtPath: string,
    outputPath: string,
    options: SubtitleOptions
  ): Promise<void> {
    const filterComplex = `subtitles=${srtPath}:force_style='FontName=${options.fontFamily},FontSize=${options.fontSize},PrimaryColour=${options.color},Alignment=${options.alignment}'`;

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, [
        '-i', videoPath,
        '-vf', filterComplex,
        '-c:a', 'copy',
        outputPath,
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  }

  async addLogo(
    videoPath: string,
    logoPath: string,
    position: { x: number; y: number },
    outputPath: string
  ): Promise<void> {
    const overlay = `overlay=${position.x}:${position.y}`;

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, [
        '-i', videoPath,
        '-i', logoPath,
        '-filter_complex', overlay,
        '-c:a', 'copy',
        outputPath,
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });
  }
}
```

---

### 2.3 API 金鑰儲存

**選擇**: **macOS Keychain (透過 `keytar` 套件)**

**原因**:
- ✅ macOS 原生加密儲存
- ✅ 比環境變數安全
- ✅ 不會被誤 commit 到 Git

**封裝層** (`src/main/keychain.ts`):
```typescript
import * as keytar from 'keytar';

const SERVICE_NAME = 'YouTubeMaker';

export class KeychainService {
  async setApiKey(service: string, key: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, service, key);
  }

  async getApiKey(service: string): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, service);
  }

  async deleteApiKey(service: string): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, service);
  }

  async getAllApiKeys(): Promise<ApiKeys> {
    const keys = {
      googleTTS: await this.getApiKey('google-tts'),
      gemini: await this.getApiKey('gemini'),
      replicate: await this.getApiKey('replicate'),
      dId: await this.getApiKey('d-id'),
      youtubeClientId: await this.getApiKey('youtube-client-id'),
      youtubeClientSecret: await this.getApiKey('youtube-client-secret'),
    };
    return keys;
  }
}
```

---

### 2.4 長時間任務管理

**選擇**: **Worker Threads (Node.js)**

**原因**:
- ✅ 避免阻塞 Main Process (影片合成可能需要數分鐘)
- ✅ 支援進度回報
- ✅ 可取消執行中的任務

**封裝層** (`src/main/worker-manager.ts`):
```typescript
import { Worker } from 'worker_threads';
import path from 'path';

export class WorkerManager {
  private activeWorkers: Map<string, Worker> = new Map();

  async runTask<T>(
    taskType: 'ffmpeg' | 'api-call',
    data: any,
    onProgress: (percent: number) => void
  ): Promise<T> {
    const workerId = `${taskType}-${Date.now()}`;
    const workerPath = path.join(__dirname, 'workers', `${taskType}.worker.js`);

    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, { workerData: data });
      this.activeWorkers.set(workerId, worker);

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          onProgress(message.percent);
        } else if (message.type === 'complete') {
          resolve(message.result);
          this.cleanupWorker(workerId);
        }
      });

      worker.on('error', (error) => {
        reject(error);
        this.cleanupWorker(workerId);
      });
    });
  }

  cancelTask(taskId: string): void {
    const worker = this.activeWorkers.get(taskId);
    if (worker) {
      worker.terminate();
      this.activeWorkers.delete(taskId);
    }
  }

  private cleanupWorker(workerId: string): void {
    const worker = this.activeWorkers.get(workerId);
    if (worker) {
      worker.terminate();
      this.activeWorkers.delete(workerId);
    }
  }
}
```

---

## 3. 檔案系統架構

### 3.1 專案目錄結構

**選擇**: **每個專案一個資料夾**

**專案根目錄**:
```
~/Documents/YouTubeMaker/
├── projects/                      # 所有專案
│   ├── project-001/
│   │   ├── project.json           # 專案元資料
│   │   ├── script.txt             # 原始文稿
│   │   ├── audio.mp3              # TTS 配音
│   │   ├── script.json            # Gemini 腳本 (JSON)
│   │   ├── images/                # 生成的圖片
│   │   │   ├── segment-01.png
│   │   │   ├── segment-02.png
│   │   │   └── ...
│   │   ├── did-videos/            # D-ID 對嘴影片 (若有)
│   │   │   ├── segment-01.mp4
│   │   │   └── ...
│   │   ├── subtitles.srt          # 字幕檔案
│   │   ├── logo.png               # Logo (若有)
│   │   ├── video.mp4              # 最終影片
│   │   └── thumbnail.jpg          # 縮圖
│   └── project-002/
│       └── ...
├── templates/                     # 範本
│   ├── template-001.json
│   └── template-002.json
├── cache/                         # 快取 (可清理)
│   ├── tts-cache/                 # TTS 快取 (相同文字重複使用)
│   └── image-cache/               # 圖片快取 (相同 prompt 重複使用)
└── logs/                          # 日誌
    ├── app.log
    └── errors.log
```

**專案元資料** (`project.json`):
```json
{
  "id": "project-001",
  "name": "我的第一支影片",
  "createdAt": "2025-10-29T10:30:00Z",
  "updatedAt": "2025-10-29T12:45:00Z",
  "status": "completed",
  "settings": {
    "voice": "zh-TW-Wavenet-A",
    "imageStyle": "digital-art",
    "useDidTalking": false,
    "subtitleStyle": {
      "fontFamily": "Noto Sans TC",
      "fontSize": 24,
      "color": "#FFFFFF",
      "alignment": 2
    },
    "logoPosition": { "x": 20, "y": 20 }
  },
  "apiUsage": {
    "tts": { "characters": 1250, "cost": 5.0 },
    "gemini": { "inputTokens": 2000, "outputTokens": 1500, "cost": 0.03 },
    "replicate": { "images": 8, "cost": 0.4 },
    "dId": { "videos": 0, "cost": 0 }
  },
  "youtube": {
    "videoId": "abc123xyz",
    "url": "https://www.youtube.com/watch?v=abc123xyz",
    "uploadedAt": "2025-10-29T13:00:00Z"
  }
}
```

---

### 3.2 快取策略

**TTS 快取**:
- Key: `md5(text + voice)` (文字 + 語音的雜湊值)
- 最大容量: 1GB
- LRU 淘汰策略 (最少使用的先刪除)

**圖片快取**:
- Key: `md5(prompt + style)` (提示詞 + 風格的雜湊值)
- 最大容量: 2GB
- LRU 淘汰策略

**實作** (`src/main/cache-manager.ts`):
```typescript
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export class CacheManager {
  private cachePath: string;
  private maxSize: number; // bytes

  constructor(type: 'tts' | 'image') {
    this.cachePath = path.join(
      app.getPath('userData'),
      'cache',
      type === 'tts' ? 'tts-cache' : 'image-cache'
    );
    this.maxSize = type === 'tts' ? 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024; // 1GB or 2GB
  }

  getCacheKey(input: string, options: string): string {
    return crypto.createHash('md5').update(input + options).digest('hex');
  }

  async get(key: string): Promise<Buffer | null> {
    const filePath = path.join(this.cachePath, key);
    if (await fs.pathExists(filePath)) {
      // 更新存取時間 (LRU)
      await fs.utimes(filePath, new Date(), new Date());
      return await fs.readFile(filePath);
    }
    return null;
  }

  async set(key: string, data: Buffer): Promise<void> {
    await fs.ensureDir(this.cachePath);
    const filePath = path.join(this.cachePath, key);
    await fs.writeFile(filePath, data);
    await this.enforceMaxSize();
  }

  private async enforceMaxSize(): Promise<void> {
    const files = await fs.readdir(this.cachePath);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(this.cachePath, file);
        const stats = await fs.stat(filePath);
        return { path: filePath, size: stats.size, atime: stats.atime };
      })
    );

    // 計算總大小
    const totalSize = fileStats.reduce((sum, f) => sum + f.size, 0);
    if (totalSize <= this.maxSize) return;

    // 按存取時間排序 (最舊的先刪除)
    fileStats.sort((a, b) => a.atime.getTime() - b.atime.getTime());

    let currentSize = totalSize;
    for (const file of fileStats) {
      if (currentSize <= this.maxSize) break;
      await fs.remove(file.path);
      currentSize -= file.size;
    }
  }

  async clear(): Promise<void> {
    await fs.remove(this.cachePath);
  }

  async getSize(): Promise<number> {
    const files = await fs.readdir(this.cachePath);
    const sizes = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(path.join(this.cachePath, file));
        return stats.size;
      })
    );
    return sizes.reduce((sum, size) => sum + size, 0);
  }
}
```

---

### 3.3 臨時檔案清理

**策略**:
- 應用關閉時自動清理 `temp/` 目錄
- 用戶手動清理快取 (在設定頁面)
- 專案刪除時清理相關檔案

**實作** (`src/main/cleanup.ts`):
```typescript
import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';

export class CleanupService {
  async cleanTempFiles(): Promise<void> {
    const tempPath = path.join(app.getPath('userData'), 'temp');
    await fs.remove(tempPath);
  }

  async cleanCache(): Promise<void> {
    const cachePath = path.join(app.getPath('userData'), 'cache');
    await fs.remove(cachePath);
  }

  async deleteProject(projectId: string): Promise<void> {
    const projectPath = path.join(
      app.getPath('documents'),
      'YouTubeMaker',
      'projects',
      projectId
    );
    await fs.remove(projectPath);
  }

  setupCleanupHooks(): void {
    // 應用關閉時清理臨時檔案
    app.on('before-quit', async () => {
      await this.cleanTempFiles();
    });
  }
}
```

---

## 4. 錯誤處理策略

### 4.1 全域錯誤邊界

**React Error Boundary**:
```typescript
// src/renderer/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // 發送錯誤到日誌服務
    window.electron.logError(error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>發生錯誤</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            重新載入應用
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Main Process 錯誤處理**:
```typescript
// src/main/error-handler.ts
import { app, dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';

export class ErrorHandler {
  private logPath: string;

  constructor() {
    this.logPath = path.join(app.getPath('userData'), 'logs', 'errors.log');
  }

  async logError(error: Error, context?: string): Promise<void> {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
    };

    await fs.appendFile(this.logPath, JSON.stringify(errorEntry) + '\n');
  }

  async showErrorDialog(title: string, message: string): Promise<void> {
    await dialog.showMessageBox({
      type: 'error',
      title,
      message,
      buttons: ['確定'],
    });
  }

  setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', async (error) => {
      await this.logError(error, 'Uncaught Exception');
      await this.showErrorDialog('應用程式錯誤', error.message);
      app.quit();
    });

    process.on('unhandledRejection', async (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      await this.logError(error, 'Unhandled Rejection');
    });
  }
}
```

---

### 4.2 重試機制

**API 呼叫重試**:
```typescript
// src/renderer/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  }
): Promise<T> {
  let lastError: Error;
  let delay = options.initialDelay;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === options.maxRetries) {
        throw lastError;
      }

      // 指數退避
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
    }
  }

  throw lastError!;
}
```

**預設重試配置**:
```typescript
// src/renderer/config/retry.ts
export const RETRY_CONFIG = {
  tts: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  gemini: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  replicate: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
  dId: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
  youtube: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
};
```

---

### 4.3 日誌記錄

**選擇**: **Winston**

**設定** (`src/main/logger.ts`):
```typescript
import winston from 'winston';
import path from 'path';
import { app } from 'electron';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'logs', 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'logs', 'errors.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// 開發環境額外輸出到 Console
if (!app.isPackaged) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

---

## 5. 效能優化

### 5.1 圖片快取策略

已在 **3.2 快取策略** 詳述。

---

### 5.2 API 呼叫並行策略

**限制並行數量 (避免 Rate Limit)**:
```typescript
// src/renderer/utils/concurrent-queue.ts
export class ConcurrentQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async add(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift()!;
    await task();
    this.running--;
    this.process();
  }
}
```

**使用範例**:
```typescript
// 限制同時生成 3 張圖片
const imageQueue = new ConcurrentQueue<GeneratedImage>(3);

const images = await Promise.all(
  prompts.map((prompt) =>
    imageQueue.add(() => replicateService.generateImage(prompt))
  )
);
```

---

### 5.3 影片預覽優化

**策略**: 生成低解析度預覽版本

```typescript
// src/main/ffmpeg.ts
async generatePreview(
  videoPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(this.ffmpegPath, [
      '-i', videoPath,
      '-vf', 'scale=640:360', // 降低解析度
      '-c:v', 'libx264',
      '-crf', '28', // 降低品質
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      '-b:a', '64k', // 降低音訊位元率
      outputPath,
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}
```

---

### 5.4 YouTube 上傳優化

**Resumable Upload (斷點續傳)**:
```typescript
// src/renderer/services/youtube-upload.ts
async uploadVideoResumable(
  filePath: string,
  metadata: VideoMetadata,
  onProgress: (percent: number) => void
): Promise<string> {
  const fileSize = await fs.stat(filePath).then((s) => s.size);
  const chunkSize = 256 * 1024 * 1024; // 256MB

  // 1. 初始化上傳
  const uploadUrl = await this.initiateUpload(metadata, fileSize);

  // 2. 分片上傳
  let uploadedBytes = 0;
  while (uploadedBytes < fileSize) {
    const chunk = await this.readChunk(filePath, uploadedBytes, chunkSize);
    await this.uploadChunk(uploadUrl, chunk, uploadedBytes, fileSize);
    uploadedBytes += chunk.length;
    onProgress((uploadedBytes / fileSize) * 100);
  }

  // 3. 完成上傳
  return await this.finalizeUpload(uploadUrl);
}

private async uploadChunk(
  uploadUrl: string,
  chunk: Buffer,
  start: number,
  total: number
): Promise<void> {
  const end = start + chunk.length - 1;
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': chunk.length.toString(),
      'Content-Range': `bytes ${start}-${end}/${total}`,
    },
    body: chunk,
  });
}
```

---

## 6. 開發環境設定

### 6.1 專案初始化

**Prerequisites**:
- Node.js >= 18.0.0
- npm >= 9.0.0
- macOS >= 12.0 (Monterey)

**安裝步驟**:
```bash
# 1. Clone repository
git clone <repo-url>
cd YTMaker3

# 2. 安裝依賴
npm install

# 3. 設定 FFmpeg
npm run setup:ffmpeg

# 4. 啟動開發伺服器
npm run dev
```

---

### 6.2 環境變數

**開發環境** (`.env.development`):
```bash
# API Endpoints
VITE_GOOGLE_TTS_ENDPOINT=https://texttospeech.googleapis.com/v1
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1
VITE_REPLICATE_ENDPOINT=https://api.replicate.com/v1
VITE_DID_ENDPOINT=https://api.d-id.com
VITE_YOUTUBE_ENDPOINT=https://www.googleapis.com/youtube/v3

# YouTube OAuth
VITE_YOUTUBE_REDIRECT_URI=http://localhost:3000/oauth/callback

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

**生產環境** (`.env.production`):
```bash
VITE_YOUTUBE_REDIRECT_URI=youtubemak://oauth/callback
VITE_DEV_MODE=false
VITE_LOG_LEVEL=info
```

---

### 6.3 測試框架

**選擇**: **Vitest (單元測試) + Playwright (E2E 測試)**

**單元測試配置** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
```

**E2E 測試配置** (`playwright.config.ts`):
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'electron',
      use: {
        // Electron 特定配置
      },
    },
  ],
});
```

---

## 7. API 整合細節補充

### 7.1 YouTube OAuth 2.0 詳細流程

**步驟**:
1. 使用者點擊「連接 YouTube」
2. 開啟系統預設瀏覽器,導向 Google OAuth URL
3. 使用者授權後,Google 重定向到 `youtubemak://oauth/callback?code=xxx`
4. Electron 捕捉 Deep Link,取得 Authorization Code
5. 使用 Authorization Code 換取 Access Token + Refresh Token
6. 儲存 Token 到 Keychain

**實作** (`src/main/youtube-oauth.ts`):
```typescript
import { BrowserWindow, shell } from 'electron';
import { google } from 'googleapis';

export class YouTubeOAuthService {
  private oauth2Client: any;

  constructor(clientId: string, clientSecret: string) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'youtubemak://oauth/callback'
    );
  }

  async authorize(): Promise<string> {
    // 1. 生成授權 URL
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });

    // 2. 開啟瀏覽器
    await shell.openExternal(authUrl);

    // 3. 等待 Deep Link 回調
    return new Promise((resolve, reject) => {
      app.on('open-url', async (event, url) => {
        event.preventDefault();

        if (url.startsWith('youtubemak://oauth/callback')) {
          const code = new URL(url).searchParams.get('code');
          if (code) {
            // 4. 換取 Token
            const { tokens } = await this.oauth2Client.getToken(code);
            resolve(tokens.access_token);
          } else {
            reject(new Error('No authorization code'));
          }
        }
      });
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token;
  }
}
```

---

### 7.2 YouTube Resumable Upload 實作細節

已在 **5.4 YouTube 上傳優化** 詳述。

---

## 8. 狀態管理設計

### 8.1 狀態持久化

**選擇**: **Zustand Persist Middleware + IndexedDB**

**原因**:
- ✅ IndexedDB 容量大 (比 localStorage 大得多)
- ✅ 支援儲存 Blob (圖片、音訊)
- ✅ 非同步操作 (不阻塞 UI)

**實作** (`src/renderer/stores/projectStore.ts`):
```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectStore {
  currentProject: Project | null;
  recentProjects: Project[];
  setCurrentProject: (project: Project) => void;
  addRecentProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProject: null,
      recentProjects: [],
      setCurrentProject: (project) => set({ currentProject: project }),
      addRecentProject: (project) =>
        set((state) => ({
          recentProjects: [
            project,
            ...state.recentProjects.filter((p) => p.id !== project.id),
          ].slice(0, 10), // 只保留最近 10 個
        })),
    }),
    {
      name: 'project-storage',
      storage: {
        getItem: async (name) => {
          const db = await openDB('youtubemak', 1);
          return db.get('store', name);
        },
        setItem: async (name, value) => {
          const db = await openDB('youtubemak', 1);
          await db.put('store', value, name);
        },
        removeItem: async (name) => {
          const db = await openDB('youtubemak', 1);
          await db.delete('store', name);
        },
      },
    }
  )
);
```

---

### 8.2 跨頁面狀態傳遞

**策略**: 使用 Zustand 全域 Store (無需 React Context)

**範例**:
```typescript
// 頁面 A 設定狀態
const { setCurrentProject } = useProjectStore();
setCurrentProject(newProject);
navigate('/script-editor');

// 頁面 B 讀取狀態
const { currentProject } = useProjectStore();
// currentProject 已自動同步
```

---

## 9. 部署與打包

### 9.1 應用打包

**選擇**: **Electron Builder**

**配置** (`electron-builder.json`):
```json
{
  "appId": "com.yourcompany.youtubemak",
  "productName": "YouTube Maker",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "resources/**/*"
  ],
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["arm64", "x64"]
      }
    ],
    "category": "public.app-category.productivity",
    "icon": "build/icon.icns",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  },
  "dmg": {
    "contents": [
      {
        "x": 130,
        "y": 220
      },
      {
        "x": 410,
        "y": 220,
        "type": "link",
        "path": "/Applications"
      }
    ]
  }
}
```

---

### 9.2 Code Signing (macOS)

**需求**:
- Apple Developer Account
- Developer ID Application Certificate

**簽章指令**:
```bash
npm run build:mac
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" ./release/YouTubeMaker.app
```

---

### 9.3 自動更新

**選擇**: **electron-updater**

**實作** (`src/main/updater.ts`):
```typescript
import { autoUpdater } from 'electron-updater';
import { app, dialog } from 'electron';

export class UpdaterService {
  setupAutoUpdater(): void {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      dialog.showMessageBox({
        type: 'info',
        title: '發現新版本',
        message: '正在下載新版本...',
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog
        .showMessageBox({
          type: 'info',
          title: '更新準備就緒',
          message: '新版本已下載完成,是否立即重新啟動?',
          buttons: ['立即重啟', '稍後'],
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    });
  }
}
```

---

## 10. 開發指令總覽

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構應用 (不打包)
npm run build

# 打包 macOS 應用
npm run build:mac

# 執行單元測試
npm run test

# 執行 E2E 測試
npm run test:e2e

# 執行測試覆蓋率
npm run test:coverage

# Lint 程式碼
npm run lint

# 格式化程式碼
npm run format

# 清理快取
npm run clean
```

---

## 11. 技術棧總結

| 層級 | 技術 | 版本 | 用途 |
|------|------|------|------|
| **應用框架** | Electron | 28.0.0 | 桌面應用框架 |
| **前端框架** | React | 18.2.0 | UI 渲染 |
| **語言** | TypeScript | 5.3.0 | 類型安全 |
| **狀態管理** | Zustand | 4.4.0 | 全域狀態 |
| **路由** | React Router | 6.20.0 | 頁面路由 |
| **UI 元件** | Radix UI | 1.0.0 | Headless 元件 |
| **樣式** | Tailwind CSS | 3.4.0 | Utility-first CSS |
| **建構工具** | Vite | 5.0.0 | 開發伺服器 + 打包 |
| **測試** | Vitest | 1.0.0 | 單元測試 |
| **E2E 測試** | Playwright | 1.40.0 | E2E 測試 |
| **影片處理** | FFmpeg | 6.0 (靜態二進位) | 影片合成 |
| **密鑰儲存** | keytar | 7.9.0 | macOS Keychain 存取 |
| **日誌** | winston | 3.11.0 | 日誌記錄 |
| **HTTP 客戶端** | fetch (原生) | - | API 呼叫 |
| **檔案操作** | fs-extra | 11.2.0 | 檔案系統增強 |

---

## 12. 待解決問題

### 12.1 YouTube API 配額限制

**問題**: YouTube Data API 每日配額有限 (10,000 units)
**解決方案**:
- 在上傳頁面顯示剩餘配額
- 提供「儲存草稿,稍後上傳」選項

---

### 12.2 FFmpeg 進度解析

**問題**: FFmpeg 進度輸出格式不統一
**解決方案**:
- 使用 `-progress pipe:1` 參數
- 解析 `time=` 欄位計算百分比

---

### 12.3 D-ID API 費用過高

**問題**: D-ID 對嘴影片生成費用較高 ($0.3-$0.5/影片)
**解決方案**:
- 預設關閉 D-ID 功能
- 在腳本編輯頁面清楚顯示費用預估
- 提供「僅使用靜態圖片」選項

---

## 13. 下一步

完成此技術架構文件後,接下來執行:

```bash
/speckit.plan
```

此指令將基於:
1. `spec.md` (功能需求)
2. `visual-spec/` (視覺設計)
3. `tech-stack.md` (本文件)

生成 `design-spec.yaml`,包含:
- 資料模型定義
- API 整合細節
- 元件分解
- Work Package 規劃
- 測試策略
- 部署流程
