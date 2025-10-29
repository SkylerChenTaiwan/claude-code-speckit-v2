#!/bin/bash

# 此腳本為每個 WP 生成基礎 README、contract 和 journal 檔案

# WP002: 文稿輸入與 TTS 功能
cat > WP002-script-input-tts/README.md << 'EOF'
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
EOF

cat > WP002-script-input-tts/journal.md << 'EOF'
# Work Package WP002 - Implementation Journal

**Work Package**: WP002 - 文稿輸入與 TTS 功能
**Created**: 2025-10-29

## 📝 Sessions

（待 AI 實作時填寫）

## ✅ 驗證準備

執行: `/speckit.verify --wp WP002`
EOF

# WP003: Gemini 腳本生成功能
cat > WP003-gemini-script-generation/README.md << 'EOF'
# Work Package WP003: Gemini 腳本生成功能

**Work Package ID**: WP003
**Type**: Complete Feature - Full Stack  
**Status**: ⏳ Not Started

## 📋 Overview

實作 Gemini AI 腳本生成功能，將文稿和時間標記轉換為結構化腳本（包含段落和圖片提示詞）。

**功能範圍**：
- 後端：gemini:generateScript IPC handler + GeminiService
- 前端：進度追蹤 UI（在 ScriptInputPage 之後）
- 資料：Script, ScriptParagraph
- 測試：Unit + Integration + E2E

## 🎯 Objectives

- [ ] 呼叫 Gemini API 生成結構化腳本
- [ ] 解析 Gemini 回應並提取段落、圖片提示詞
- [ ] 錯誤處理（API 失敗、Token 超限）
- [ ] 測試覆蓋率 ≥ 80%

**涵蓋的 User Stories**：
- ✅ US001: 基本影片製作與發布 - Gemini 腳本生成部分

**驗收標準**：
- [ ] 系統可以根據文稿和時間標記生成結構化腳本
- [ ] 每個段落包含文字、時間、圖片提示詞（英文+中文）
- [ ] API 失敗時提供重試選項

## 📚 Tasks Breakdown

- task-001-write-tests.md
- task-002-implement-backend.md
- task-003-implement-frontend.md
- task-004-integration.md

## 🔗 Dependencies

**零相依** - 可與所有其他 WP 平行執行

## 📝 Deliverables

- src/main/ipc/geminiHandlers.ts
- src/main/services/GeminiService.ts
- 前端進度追蹤元件
- 測試檔案

## 🔄 Traceability

- Design Spec: design-spec.yaml#api_endpoints.gemini_generateScript
- Data Models: Script, ScriptParagraph
EOF

cat > WP003-gemini-script-generation/journal.md << 'EOF'
# Work Package WP003 - Implementation Journal

**Created**: 2025-10-29

（待 AI 實作時填寫）
EOF

echo "Generated WP002-WP003 files"

