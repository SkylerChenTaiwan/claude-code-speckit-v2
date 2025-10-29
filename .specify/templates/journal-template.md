# Work Package WP[###] - Implementation Journal

**Work Package**: WP[###] - [WP Name]
**Created**: [TIMESTAMP]

---

## 📝 Purpose

此 journal 記錄所有在實作此 Work Package 時的決定、進度和問題。

每完成一個 task，必須在此記錄：
- 做了什麼
- 建立/修改了哪些檔案
- 遇到什麼問題和如何解決
- 做了什麼重要決定

---

## Session 1: Task-001 - [Task Name]

**執行時間**: [START_TIME] - [END_TIME]
**狀態**: [⏳ 進行中 | ✅ 完成 | ❌ 失敗]

### 做了什麼
- [列出主要完成的工作項目]
- [第二項工作]
- [第三項工作]

### 建立的檔案
- `[file path 1]` ([行數] 行) - [檔案用途]
- `[file path 2]` ([行數] 行) - [檔案用途]

### 修改的檔案
- `[file path 1]` (新增 [X] 行，刪除 [Y] 行)

### 測試結果
- 測試數量：[X] 個
- 測試通過：[Y] 個
- 測試失敗：[Z] 個
- 測試覆蓋率：[X]%

### 重要決定

#### 決定 1: [決定標題]
**問題**: [描述遇到的問題或需要決定的事項]
**選項**:
- 選項 A: [描述]
- 選項 B: [描述]

**決定**: 選擇 [選項 A/B]
**原因**: [為什麼做這個決定]

### 遇到的問題

#### 問題 1: [問題標題]
**描述**: [詳細描述問題]
**解決方法**: [如何解決]
**耗時**: [X] 分鐘

### 契約檢查
- [ ] 所有欄位名稱與 contract-expected.yaml 一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同
- [ ] 沒有新增契約外的欄位

---

## Session 2: Task-002 - [Task Name]

**執行時間**: [START_TIME] - [END_TIME]
**狀態**: [⏳ 進行中 | ✅ 完成 | ❌ 失敗]

### 做了什麼
- [列出主要完成的工作項目]

### 建立的檔案
- `[file path]` ([行數] 行)

### 修改的檔案
- `[file path]` (新增 [X] 行)

### 測試結果
- 測試數量：[X] 個
- 測試通過：[Y] 個
- 測試覆蓋率：[X]%

### 重要決定
[記錄決定]

### 遇到的問題
[記錄問題和解決方法]

### 契約檢查
- [ ] 契約檢查項目

---

## Session 3: Task-003 - [Task Name]

[同上格式]

---

## Session 4: Task-004 - [Task Name]

[同上格式]

---

## 📊 Summary

### 整體進度
- Total Tasks: [X]
- Completed: [Y]
- In Progress: [Z]
- Failed: [W]

### 檔案統計
- 新增檔案：[X] 個
- 修改檔案：[Y] 個
- 總程式碼行數：約 [X] 行

### 測試統計
- 總測試數量：[X] 個
- 測試覆蓋率：[X]%
- 測試全部通過：[✅ 是 | ❌ 否]

### 主要挑戰
1. [挑戰 1]
2. [挑戰 2]

### 學到的教訓
1. [教訓 1]
2. [教訓 2]

---

## ✅ 驗證準備

### Pre-Verification Checklist
- [ ] 所有 tasks 已完成
- [ ] 所有測試通過
- [ ] 測試覆蓋率 ≥ 80%
- [ ] 所有欄位名稱與契約一致
- [ ] 所有驗證規則已實作
- [ ] 錯誤訊息與契約完全相同
- [ ] 無 console.log 或 debug 程式碼
- [ ] 無未使用的 imports
- [ ] 程式碼已 format

### 準備驗證
執行: `/speckit.verify --wp WP[###]`

---

## 📎 參考資料

**Contract**: `work-packages/WP[###]/contract-expected.yaml`
**README**: `work-packages/WP[###]/README.md`
**Design Spec**: `design-spec.yaml`
**Visual Spec**: `visual-spec/`
