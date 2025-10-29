# Task: 撰寫測試 (TDD - Red)

**Work Package**: WP003 - Gemini 腳本生成功能
**Task ID**: task-001
**Type**: Write Tests
**預估時間**: 45 分鐘
**相依**: 無

---

## 🎯 你的任務

撰寫 WP003 的所有測試（後端 + 前端），讓測試先失敗（Red），定義預期行為。

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

執行: `/speckit.implement WP003/task-002` (實作後端)
