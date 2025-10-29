# Work Packages Overview - YouTube 影片快速製作工具

**功能 ID**: 001-youtube-video-maker
**分支**: 001-youtube-video-maker
**生成時間**: 2025-10-29
**總 WP 數量**: 12

---

## 📋 專案概述

本專案是一個 macOS Electron 桌面應用程式，用於快速製作 1-30 分鐘的 YouTube 影片。整合了以下服務：
- Google TTS（語音合成）
- Gemini AI（腳本生成）
- Replicate FLUX（圖片生成）
- D-ID（對嘴影片）
- FFmpeg（影片合成）
- YouTube Data API（影片上傳）

---

## 🎯 Work Package 分解策略

本專案採用**垂直切分（Vertical Slicing）**策略，每個 WP 都是一個**完整的功能切片**：

### ✅ 垂直切分原則
- **每個 WP 包含完整的前後端**（Electron Main Process + Renderer Process）
- **零相依（Zero Dependency）**- 所有 WP 可平行執行
- **獨立測試**- 每個 WP 有完整的測試（Unit + Integration + E2E）
- **允許重複**- 整合階段再去重複元件

### ❌ 不採用水平切分
我們**不會**按技術層切分（例如：Model WP、API WP、UI WP），因為：
- 會產生相依性，無法平行執行
- 每個 WP 無法獨立驗證和部署
- 不符合敏捷開發的價值交付原則

---

## 📦 Work Package 列表

### WP001: 專案管理與檔案操作功能
**目錄**: `WP001-project-file-management/`
**範圍**: HomePage + file IPC handlers
**資料**: ProjectFile, ProjectSettings
**IPC**: file:read, file:write, file:select, directory:select
**狀態**: ⏳ 待執行

### WP002: 文稿輸入與 TTS 功能
**目錄**: `WP002-script-input-tts/`
**範圍**: ScriptInputPage + TTSService
**資料**: scriptContent, timecodes
**IPC**: tts:generate, tts:listVoices
**狀態**: ⏳ 待執行

### WP003: Gemini 腳本生成功能
**目錄**: `WP003-gemini-script-generation/`
**範圍**: 進度追蹤 UI + GeminiService
**資料**: Script, ScriptParagraph
**IPC**: gemini:generateScript
**狀態**: ⏳ 待執行

### WP004: 腳本編輯功能
**目錄**: `WP004-script-editor/`
**範圍**: ScriptEditorPage（段落編輯、風格選擇）
**資料**: ScriptParagraph 編輯
**IPC**: 無（純前端編輯邏輯）
**狀態**: ⏳ 待執行

### WP005: Replicate 圖片生成功能
**目錄**: `WP005-replicate-image-generation/`
**範圍**: 批次圖片生成 + 快取機制
**資料**: GeneratedImage, 快取
**IPC**: replicate:generateImage, replicate:batchGenerate
**狀態**: ⏳ 待執行

### WP006: D-ID 對嘴影片功能
**目錄**: `WP006-did-video-generation/`
**範圍**: D-ID 設定面板 + DIDService
**資料**: DIDSettings, DIDVideo
**IPC**: did:generateVideo
**狀態**: ⏳ 待執行

### WP007: 影片預覽與字幕編輯功能
**目錄**: `WP007-video-preview-subtitle/`
**範圍**: VideoPreviewPage（字幕樣式編輯）
**資料**: SubtitleStyle
**IPC**: 預覽影片生成
**狀態**: ⏳ 待執行

### WP008: Logo 編輯功能
**目錄**: `WP008-logo-editing/`
**範圍**: Logo 上傳與拖曳（在 VideoPreviewPage）
**資料**: LogoSettings, Position2D
**IPC**: 無（純前端拖曳邏輯）
**狀態**: ⏳ 待執行

### WP009: FFmpeg 影片合成功能
**目錄**: `WP009-ffmpeg-video-merge/`
**範圍**: 影片合成 + 進度追蹤
**資料**: 最終影片檔案
**IPC**: ffmpeg:mergeVideo
**狀態**: ⏳ 待執行

### WP010: YouTube 上傳與完成頁面功能
**目錄**: `WP010-youtube-upload-completion/`
**範圍**: YouTubeUploadPage + CompletionPage
**資料**: YouTube 授權、影片資訊、APIUsageStats
**IPC**: youtube:auth, youtube:listChannels, youtube:uploadVideo
**狀態**: ⏳ 待執行

### WP011: API 金鑰管理功能
**目錄**: `WP011-api-key-management/`
**範圍**: API 金鑰設定對話框 + KeychainService
**資料**: API 金鑰（macOS Keychain）
**IPC**: apiKey:get, apiKey:set
**狀態**: ⏳ 待執行

### WP012: 快取管理功能
**目錄**: `WP012-cache-management/`
**範圍**: 快取設定對話框 + 快取服務
**資料**: 快取大小統計
**IPC**: cache:getSize, cache:clear
**狀態**: ⏳ 待執行

---

## 🔄 執行順序

### ✅ 重要：所有 WP 都是零相依

雖然在實際產品流程中有邏輯順序（例如必須先有文稿才能生成腳本），但在開發階段：

**所有 12 個 Work Packages 可以同時平行執行**

這是因為：
- 每個 WP 都有完整的測試資料（Mock Data）
- 每個 WP 都獨立驗證
- 整合階段會處理 WP 之間的銜接

### 建議執行順序（僅供參考）

如果你想按照產品流程順序執行，建議：

**階段 1：基礎設施**（可平行）
- WP001: 專案管理
- WP011: API 金鑰管理
- WP012: 快取管理

**階段 2：內容生成**（可平行）
- WP002: 文稿輸入與 TTS
- WP003: Gemini 腳本生成
- WP004: 腳本編輯

**階段 3：媒體生成**（可平行）
- WP005: 圖片生成
- WP006: D-ID 對嘴影片

**階段 4：影片編輯與上傳**（可平行）
- WP007: 影片預覽與字幕
- WP008: Logo 編輯
- WP009: FFmpeg 合成
- WP010: YouTube 上傳

---

## 📖 如何執行一個 Work Package

### Step 1: 選擇一個 WP
```bash
cd work-packages/WP001-project-file-management
```

### Step 2: 閱讀 README
仔細閱讀 `README.md` 了解：
- 功能範圍
- 驗收標準
- 契約要求
- 檔案結構

### Step 3: 閱讀 Contract
仔細閱讀 `contract-expected.yaml` 了解：
- 精確的欄位名稱
- 精確的 IPC 通道名稱
- 精確的錯誤訊息
- 所有驗證規則

### Step 4: 依序執行 Tasks
```bash
/speckit.implement WP001/task-001  # 寫測試
/speckit.implement WP001/task-002  # 實作後端
/speckit.implement WP001/task-003  # 實作前端
/speckit.implement WP001/task-004  # 整合測試
```

### Step 5: 驗證
```bash
/speckit.verify --wp WP001
```

驗證會檢查：
- ✅ 所有測試通過
- ✅ 測試覆蓋率 ≥ 80%
- ✅ 欄位名稱與契約一致
- ✅ IPC 通道名稱與契約一致
- ✅ 錯誤訊息與契約一致
- ✅ 所有驗證規則已實作

### Step 6: 檢查 Journal
查看 `journal.md` 確認所有決定和問題都已記錄。

---

## ✅ 驗證指引

### 每個 WP 的驗證

執行 `/speckit.verify --wp WP[###]` 會：
1. 執行所有測試
2. 檢查測試覆蓋率
3. 比對契約（contract-expected.yaml）與實作
4. 生成驗證報告（verification-report.md）

### 全域驗證

當所有 WP 完成後，執行：
```bash
/speckit.verify --all
```

這會檢查：
- 所有 WP 的個別驗證都通過
- 沒有命名衝突
- 沒有循環相依

---

## 🔗 整合指引

### 何時開始整合

當**所有 WP 都驗證通過**後，執行：
```bash
/speckit.analyze     # 分析重複元件和命名衝突
/speckit.integrate   # 整合所有 WP
/speckit.test        # 執行整合測試
```

### 整合會做什麼

1. **合併重複元件**
   - 例如：12 個 WP 都建立了自己的 Button 元件
   - 整合後會選擇最佳實作，其他 WP 改用統一元件

2. **解決命名衝突**
   - 例如：WP002 和 WP003 都有 `formatTimestamp` 函數
   - 整合後會重新命名或合併

3. **建立統一目錄結構**
   - 將所有 WP 的檔案整合到主專案結構
   - 建立統一的 src/ 目錄

4. **執行 E2E 測試**
   - 測試完整的使用者流程（從文稿到發布）

---

## 📊 進度追蹤

### 目前狀態

| WP | 名稱 | Status | Tasks | Tests | Coverage |
|----|------|--------|-------|-------|----------|
| WP001 | 專案管理 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP002 | TTS | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP003 | Gemini | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP004 | 腳本編輯 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP005 | 圖片生成 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP006 | D-ID | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP007 | 字幕 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP008 | Logo | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP009 | 合成 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP010 | YouTube | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP011 | API 金鑰 | ⏳ 待執行 | 0/4 | 0 | 0% |
| WP012 | 快取 | ⏳ 待執行 | 0/4 | 0 | 0% |

**總進度**: 0/12 (0%)

執行 `/speckit.status` 可查看即時進度。

---

## 📁 檔案結構

```
work-packages/
├── README.md                                    # 本檔案
├── WP001-project-file-management/
│   ├── README.md
│   ├── contract-expected.yaml
│   ├── task-001-write-tests.md
│   ├── task-002-implement-backend.md
│   ├── task-003-implement-frontend.md
│   ├── task-004-integration.md
│   ├── journal.md
│   └── verification-report.md                   # (verify 後生成)
├── WP002-script-input-tts/
│   └── ...
├── WP003-gemini-script-generation/
│   └── ...
... (WP004-WP012)
```

---

## 🎓 最佳實踐

### 1. 先讀 Contract，再寫程式碼
- Contract 是契約，不可偏離
- 欄位名稱、錯誤訊息都必須 word-for-word

### 2. TDD 流程
- Red（寫失敗的測試）→ Green（實作讓測試通過）→ Refactor（重構）
- 不要跳過 Red 階段

### 3. 記錄所有決定
- 在 journal.md 記錄重要決定和遇到的問題
- 幫助後續維護和除錯

### 4. 獨立驗證
- 每個 WP 完成後立即驗證
- 不要等到所有 WP 完成才驗證

### 5. 不要修改其他 WP 的檔案
- 每個 WP 應該完全獨立
- 整合階段會處理重複和衝突

---

## 🚀 開始執行

選擇任一 WP 開始：

```bash
# 建議從 WP001 或 WP011 開始
cd WP001-project-file-management
cat README.md

# 開始第一個 task
/speckit.implement WP001/task-001
```

---

## 📚 相關文件

- Design Spec: `../design-spec.yaml`
- Visual Spec: `../visual-spec/`
- Requirements: `../spec.md`
- Constitution: `../../.specify/constitution.yaml`

---

**最後更新**: 2025-10-29
**版本**: 1.0.0
