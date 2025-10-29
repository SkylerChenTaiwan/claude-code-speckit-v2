# Work Package WP002: 文稿輸入與 TTS 功能

**Work Package ID**: WP002
**Type**: Complete Feature - Full Stack
**Status**: ⏳ Not Started

## 📋 Overview

實作文稿輸入頁面和 Google TTS 語音合成功能。

**功能範圍**：
- 後端：tts:generate, tts:listVoices IPC handlers + TTSService
- 前端：ScriptInputPage（文稿輸入、語音選擇、字數統計）
- 測試：Unit + Integration + E2E

## 🎯 Objectives

- [ ] 實作完整的文稿輸入與 TTS 功能
- [ ] 文稿驗證（最少 10 字）
- [ ] 即時字數統計和影片時長預估
- [ ] TTS 生成配音和時間標記
- [ ] 測試覆蓋率 ≥ 80%

**涵蓋的 User Stories**：
- ✅ US001: 基本影片製作與發布 - 文稿輸入與 TTS 部分

**驗收標準**：
- [ ] 使用者可以輸入文稿（10-10000 字）
- [ ] 使用者可以選擇 TTS 語音
- [ ] 系統自動生成配音和時間標記
- [ ] 錯誤處理完善（API 失敗、網路問題）

## 📚 Tasks Breakdown

- task-001-write-tests.md (45 分鐘)
- task-002-implement-backend.md (60 分鐘)
- task-003-implement-frontend.md (60 分鐘)
- task-004-integration.md (45 分鐘)

## 🔗 Dependencies

**零相依** - 可立即執行，可與所有其他 WP 平行執行

## 📝 Deliverables

### 後端
- src/main/ipc/ttsHandlers.ts
- src/main/services/TTSService.ts
- 測試檔案

### 前端
- src/renderer/pages/ScriptInputPage/
- 測試檔案

## 🔄 Traceability

- Design Spec: design-spec.yaml#api_endpoints.tts_*, #ui_components.ScriptInputPage
- Visual Spec: visual-spec/pages/02-script-input-page.md
