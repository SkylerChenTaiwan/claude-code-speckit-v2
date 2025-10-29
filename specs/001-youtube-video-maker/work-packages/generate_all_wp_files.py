#!/usr/bin/env python3
"""
批次生成 WP002-WP012 的所有檔案
每個 WP 生成 7 個檔案：README, contract, 4 tasks, journal
"""

import os
import yaml

# WP 配置
WP_CONFIGS = {
    "WP002": {
        "name": "文稿輸入與 TTS 功能",
        "ipc_channels": ["tts:generate", "tts:listVoices"],
        "services": ["TTSService"],
        "pages": ["ScriptInputPage"],
        "data_models": ["Timecode"],
    },
    "WP003": {
        "name": "Gemini 腳本生成功能",
        "ipc_channels": ["gemini:generateScript"],
        "services": ["GeminiService"],
        "pages": [],
        "data_models": ["Script", "ScriptParagraph"],
    },
    "WP004": {
        "name": "腳本編輯功能",
        "ipc_channels": [],
        "services": [],
        "pages": ["ScriptEditorPage"],
        "data_models": ["Script", "ScriptParagraph"],
    },
    "WP005": {
        "name": "Replicate 圖片生成功能",
        "ipc_channels": ["replicate:generateImage", "replicate:batchGenerate"],
        "services": ["ReplicateService"],
        "pages": [],
        "data_models": ["GeneratedImage"],
    },
    "WP006": {
        "name": "D-ID 對嘴影片功能",
        "ipc_channels": ["did:generateVideo"],
        "services": ["DIDService"],
        "pages": [],
        "data_models": ["DIDVideo", "DIDSettings"],
    },
    "WP007": {
        "name": "影片預覽與字幕編輯功能",
        "ipc_channels": [],
        "services": [],
        "pages": ["VideoPreviewPage"],
        "data_models": ["SubtitleStyle"],
    },
    "WP008": {
        "name": "Logo 編輯功能",
        "ipc_channels": [],
        "services": [],
        "pages": ["VideoPreviewPage"],
        "data_models": ["LogoSettings", "Position2D"],
    },
    "WP009": {
        "name": "FFmpeg 影片合成功能",
        "ipc_channels": ["ffmpeg:mergeVideo"],
        "services": ["FFmpegService"],
        "pages": [],
        "data_models": [],
    },
    "WP010": {
        "name": "YouTube 上傳與完成頁面功能",
        "ipc_channels": ["youtube:auth", "youtube:listChannels", "youtube:uploadVideo"],
        "services": ["YouTubeService"],
        "pages": ["YouTubeUploadPage", "CompletionPage"],
        "data_models": ["APIUsageStats", "YouTubeUsage"],
    },
    "WP011": {
        "name": "API 金鑰管理功能",
        "ipc_channels": ["apiKey:get", "apiKey:set"],
        "services": ["KeychainService"],
        "pages": [],
        "data_models": [],
    },
    "WP012": {
        "name": "快取管理功能",
        "ipc_channels": ["cache:getSize", "cache:clear"],
        "services": [],
        "pages": [],
        "data_models": [],
    },
}

def generate_task_001(wp_id, wp_name):
    """生成 task-001-write-tests.md"""
    return f"""# Task: 撰寫測試 (TDD - Red)

**Work Package**: {wp_id} - {wp_name}
**Task ID**: task-001
**Type**: Write Tests
**預估時間**: 45 分鐘
**相依**: 無

---

## 🎯 你的任務

撰寫 {wp_id} 的所有測試（後端 + 前端），讓測試先失敗（Red），定義預期行為。

---

## 📋 TDD 流程

### Step 1: 寫測試（Red）🔴

先寫**會失敗**的測試，定義預期行為。

### Step 2: 執行測試

```bash
# 後端測試 (Jest)
npm test

# 前端測試 (Vitest)
npm test
```

**預期結果**: ❌ 測試失敗（因為功能還沒實作）

---

## 📜 契約

從 `contract-expected.yaml` 提取相關部分，確保：
- 使用**精確的欄位名稱**
- 實作**所有**驗證規則
- 使用**精確的**錯誤訊息

---

## 🧪 測試範例

根據 design-spec.yaml#technical_context.testing：
- 後端：Jest + Supertest
- 前端：Vitest + React Testing Library

參考 WP001 的測試範例結構。

---

## ✅ 完成檢查清單

- [ ] 後端測試已建立（至少 6 個測試）
- [ ] 前端測試已建立（至少 6 個測試）
- [ ] 測試涵蓋成功路徑、錯誤路徑、邊界條件
- [ ] 錯誤訊息與契約完全相同
- [ ] 測試執行並失敗（Red 階段）

---

## 📝 記錄到 Journal

```markdown
## Session 1: Task-001 - 撰寫測試

**執行時間**: [時間]
**狀態**: ✅ 完成

### 做了什麼
- 建立後端測試（X 個測試）
- 建立前端測試（Y 個測試）
- 涵蓋所有成功路徑和錯誤情境

### 測試結果
- 測試數量：X 個
- 測試失敗：X 個（預期）

---
```

---

## 🔄 下一步

執行: `/speckit.implement {wp_id}/task-002` (實作後端)
"""

def generate_task_002(wp_id, wp_name):
    """生成 task-002-implement-backend.md"""
    return f"""# Task: 實作後端 (TDD - Green)

**Work Package**: {wp_id} - {wp_name}
**Task ID**: task-002
**Type**: Implement Backend
**預估時間**: 60 分鐘
**相依**: task-001 必須先完成

---

## 🎯 你的任務

實作後端 IPC handlers 和 Service 層，讓 task-001 的測試通過（Green）。

---

## 📝 要建立的檔案

根據 contract-expected.yaml 中的定義：
- IPC handlers
- Service 層
- Utility functions

---

## 📜 契約

**重要**：所有欄位名稱、錯誤訊息必須與 contract-expected.yaml 完全一致。

參考 WP001 的實作範例。

---

## ✅ 完成檢查清單

- [ ] 所有後端檔案已建立
- [ ] 所有欄位名稱與契約一致
- [ ] 所有錯誤訊息與契約一致
- [ ] 測試通過（Green）

---

## 🔄 下一步

執行: `/speckit.implement {wp_id}/task-003` (實作前端)
"""

def generate_task_003(wp_id, wp_name):
    """生成 task-003-implement-frontend.md"""
    return f"""# Task: 實作前端 (TDD - Green)

**Work Package**: {wp_id} - {wp_name}
**Task ID**: task-003
**Type**: Implement Frontend
**預估時間**: 60 分鐘
**相依**: task-001, task-002 必須先完成

---

## 🎯 你的任務

實作前端 UI 元件，讓 task-001 的前端測試通過（Green）。

---

## 📝 要建立的檔案

根據 contract-expected.yaml 中的 ui_components：
- 主頁面元件
- 子元件
- 狀態管理（如需要）

---

## 📜 契約

確保：
- 所有 element ID 和 testId 與契約一致
- IPC 呼叫格式正確
- 錯誤處理完善

---

## ✅ 完成檢查清單

- [ ] 所有前端檔案已建立
- [ ] 所有元件已渲染
- [ ] IPC 呼叫邏輯正確
- [ ] 測試通過（Green）

---

## 🔄 下一步

執行: `/speckit.implement {wp_id}/task-004` (整合測試)
"""

def generate_task_004(wp_id, wp_name):
    """生成 task-004-integration.md"""
    return f"""# Task: 整合與 E2E 測試 (TDD - Refactor)

**Work Package**: {wp_id} - {wp_name}
**Task ID**: task-004
**Type**: Integration
**預估時間**: 45 分鐘
**相依**: task-001, task-002, task-003 必須先完成

---

## 🎯 你的任務

前後端整合，撰寫 E2E 測試，確認完整流程正常運作，並重構程式碼。

---

## 📝 要建立的檔案

- E2E 測試（Playwright）
- 在 main.ts 註冊 IPC handlers（如需要）

---

## ✅ 完成檢查清單

- [ ] E2E 測試已建立
- [ ] IPC handlers 已註冊
- [ ] 所有測試通過（Unit + Integration + E2E）
- [ ] 測試覆蓋率 ≥ 80%
- [ ] 程式碼已重構

---

## 🔄 下一步

執行: `/speckit.verify --wp {wp_id}` (驗證契約)
"""

def generate_journal(wp_id, wp_name):
    """生成 journal.md"""
    return f"""# Work Package {wp_id} - Implementation Journal

**Work Package**: {wp_id} - {wp_name}
**Created**: 2025-10-29

---

## 📝 Purpose

此 journal 記錄所有在實作此 Work Package 時的決定、進度和問題。

---

## Session 1: Task-001 - 撰寫測試

**執行時間**: [待填入]
**狀態**: ⏳ 待執行

---

## Session 2: Task-002 - 實作後端

**執行時間**: [待填入]
**狀態**: ⏳ 待執行

---

## Session 3: Task-003 - 實作前端

**執行時間**: [待填入]
**狀態**: ⏳ 待執行

---

## Session 4: Task-004 - 整合測試

**執行時間**: [待填入]
**狀態**: ⏳ 待執行

---

## 📊 Summary

（執行完所有 tasks 後填寫）

---

## ✅ 驗證準備

### Pre-Verification Checklist
- [ ] 所有 tasks 已完成
- [ ] 所有測試通過
- [ ] 測試覆蓋率 ≥ 80%
- [ ] 所有欄位名稱與契約一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同

### 準備驗證
執行: `/speckit.verify --wp {wp_id}`
"""

def main():
    """主函數：為每個 WP 生成檔案"""
    base_dir = "/Users/skyler/coding/YTMaker3/specs/001-youtube-video-maker/work-packages"

    for wp_id, config in WP_CONFIGS.items():
        wp_name = config["name"]

        # 確定 WP 目錄
        wp_dirs = [d for d in os.listdir(base_dir) if d.startswith(wp_id)]
        if not wp_dirs:
            print(f"⚠️  找不到 {wp_id} 的目錄")
            continue

        wp_dir = os.path.join(base_dir, wp_dirs[0])

        # 生成 task 檔案
        tasks = [
            ("task-001-write-tests.md", generate_task_001(wp_id, wp_name)),
            ("task-002-implement-backend.md", generate_task_002(wp_id, wp_name)),
            ("task-003-implement-frontend.md", generate_task_003(wp_id, wp_name)),
            ("task-004-integration.md", generate_task_004(wp_id, wp_name)),
            ("journal.md", generate_journal(wp_id, wp_name)),
        ]

        for filename, content in tasks:
            file_path = os.path.join(wp_dir, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 已生成: {wp_id}/{filename}")

    print("\n🎉 所有檔案生成完成！")

if __name__ == "__main__":
    main()
