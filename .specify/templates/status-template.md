# Work Packages 狀態總覽

**最後更新**: {{TIMESTAMP}}
**功能**: {{FEATURE_NAME}}

---

## 📊 進度總覽

| 指標 | 數量 | 百分比 |
|------|------|--------|
| 總 WP 數 | {{TOTAL_WP}} | 100% |
| ✅ 已完成 | {{COMPLETED}} | {{COMPLETED_PCT}}% |
| 🔄 進行中 | {{IN_PROGRESS}} | {{IN_PROGRESS_PCT}}% |
| ⏳ 待開始 | {{PENDING}} | {{PENDING_PCT}}% |
| ❌ 失敗 | {{FAILED}} | {{FAILED_PCT}}% |

**整體完成度**: {{OVERALL_COMPLETION}}%

```
{{PROGRESS_BAR}}
```

---

## 📋 WP 狀態詳情

| WP | 名稱 | 實作 | Verify | 修正次數 | 狀態 |
|----|------|------|--------|----------|------|
{{WP_STATUS_ROWS}}

**圖例**:
- 實作: ✅ 完成 / 🔄 進行中 / ⏳ 未開始
- Verify: ✅ 通過 / ❌ 失敗 / ⏳ 待驗證 / - 尚未執行

---

## ⚠️  目前問題

{{#if HAS_PROBLEMS}}
{{#each PROBLEMS}}
### {{WP_ID}} - {{WP_NAME}}

- **狀態**: {{STATUS}}
- **診斷報告**: [work-packages/{{WP_ID}}/diagnosis-report.md]({{WP_ID}}/diagnosis-report.md)
- **問題**:
{{#each ISSUES}}
  - {{ISSUE}}
{{/each}}
- **最後修正**: {{LAST_FIX_TIME}}
- **待執行**: {{SUGGESTED_COMMAND}}

---
{{/each}}
{{else}}
無問題 ✅ 所有 WP 狀態正常
{{/if}}

---

## 🎯 下一步行動

{{#if HAS_NEXT_ACTIONS}}
### 優先處理

{{#each PRIORITY_ACTIONS}}
{{INDEX}}. **{{WP_ID}} ({{STATUS}})**:
   ```bash
   {{COMMAND}}
   ```

{{/each}}

### 繼續實作

{{#each CONTINUE_ACTIONS}}
{{INDEX}}. **{{WP_ID}} ({{STATUS}})**:
   ```bash
   {{COMMAND}}
   ```

{{/each}}
{{else}}
🎉 所有 WP 已完成！可以執行整合：

```bash
/speckit.analyze
/speckit.integrate --full
/speckit.test --integration
```
{{/if}}

---

## 📈 完成的 WP

{{#if HAS_COMPLETED}}
{{#each COMPLETED_WPS}}
### ✅ {{WP_ID}} - {{WP_NAME}}

- **Verified**: {{VERIFIED_TIME}}
- **Test Coverage**: {{COVERAGE}}%
- **修正次數**: {{FIX_COUNT}}
- **驗證報告**: [work-packages/{{WP_ID}}/verification-report.md]({{WP_ID}}/verification-report.md)
- **Status**: Ready for integration

---
{{/each}}
{{else}}
尚無完成的 WP
{{/if}}

---

## 📝 備註

- 總實作時間: 約 {{TOTAL_TIME}} 小時
- 平均每個 WP: {{AVG_TIME}} 小時
- 最複雜的 WP: {{MOST_COMPLEX_WP}} ({{MAX_FIX_COUNT}} 次修正)

---

**生成工具**: SpecKit V2 - `/speckit.status`
**報告時間**: {{TIMESTAMP}}
