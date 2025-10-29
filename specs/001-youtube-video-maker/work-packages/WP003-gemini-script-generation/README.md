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
