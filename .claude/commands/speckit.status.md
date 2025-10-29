---
description: Display Work Package status overview and progress tracking.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command scans all Work Packages, reads their verification reports and journals, and generates a comprehensive status overview. It helps track progress across all WPs in a feature.

**Key principle**: Provide clear visibility into WP progress and identify blockers.

## Purpose

This command provides:
- **Progress tracking**: See which WPs are complete, in progress, or blocked
- **Quick status**: Understand feature completion at a glance
- **Problem identification**: Quickly find which WPs need attention
- **Team coordination**: Share progress with team members

## Modes

### Mode 1: Generate Status (Default)

```bash
/speckit.status
```

Scans all WPs and generates/updates `work-packages/STATUS.md`.

### Mode 2: Display Status Only

```bash
/speckit.status --show
```

Displays current status in terminal without updating STATUS.md.

### Mode 3: Filter by Status

```bash
/speckit.status --filter failed
```

Show only WPs with specific status:
- `completed`: Only completed WPs
- `failed`: Only WPs with failures
- `in-progress`: Only WPs currently being worked on
- `pending`: Only WPs not yet started

### Mode 4: Detailed Status

```bash
/speckit.status --detailed
```

Include additional details:
- Test coverage for each WP
- Number of tasks completed vs total
- Time spent on each WP
- Last modified timestamp

## Execution: Mode 1 (Generate Status)

### Step 1: Setup

Locate paths:

```bash
# Get paths from prerequisites script
source .specify/scripts/bash/check-prerequisites.sh
# Returns: FEATURE_DIR, WP_DIR, etc.

WP_BASE_DIR="$FEATURE_DIR/work-packages"
STATUS_FILE="$WP_BASE_DIR/STATUS.md"
```

### Step 2: Scan Work Packages

Find all WP directories:

```bash
# Find all WP directories (WP001, WP002, etc.)
WP_DIRS=$(find "$WP_BASE_DIR" -maxdepth 1 -type d -name "WP*" | sort)
```

For each WP:

```bash
for wp_dir in $WP_DIRS; do
  WP_ID=$(basename "$wp_dir")  # e.g., WP001

  # Read WP name from requirements.md or README.md
  WP_NAME=$(grep "^# " "$wp_dir/README.md" | head -1 | sed 's/^# //')

  # Determine status (details below)
  STATUS=$(determine_wp_status "$wp_dir")

  # Count fixes
  FIX_COUNT=$(grep -c "修正" "$wp_dir/journal.md" 2>/dev/null || echo 0)

  # Store results
  WP_DATA+=("$WP_ID|$WP_NAME|$STATUS|$FIX_COUNT")
done
```

### Step 3: Determine WP Status

For each WP, determine its status by checking files:

#### Status Logic

```bash
determine_wp_status() {
  local wp_dir=$1

  # Check if implementation exists
  if [ ! -d "$wp_dir/src" ] && [ ! -f "$wp_dir/implementation.md" ]; then
    echo "⏳ 待開始"
    return
  fi

  # Check if verification passed
  if [ -f "$wp_dir/verification-report.md" ]; then
    # Parse verification report
    if grep -q "✅ PASS" "$wp_dir/verification-report.md"; then
      echo "✅ 完成"
      return
    elif grep -q "❌ FAIL" "$wp_dir/verification-report.md"; then
      # Check if diagnosis exists
      if [ -f "$wp_dir/diagnosis-report.md" ]; then
        echo "🔄 修正中"
        return
      else
        echo "❌ 失敗"
        return
      fi
    fi
  fi

  # Check if implementation in progress
  if [ -f "$wp_dir/journal.md" ]; then
    # Check last journal entry
    if grep -q "實作中" "$wp_dir/journal.md"; then
      echo "🔄 實作中"
      return
    fi
  fi

  # Check if waiting for verification
  if [ -d "$wp_dir/src" ] && [ ! -f "$wp_dir/verification-report.md" ]; then
    echo "⏳ 待驗證"
    return
  fi

  # Default
  echo "❓ 未知"
}
```

#### Status Categories

| Status | Icon | Meaning | Criteria |
|--------|------|---------|----------|
| 完成 | ✅ | WP verified and passed | verification-report.md shows PASS |
| 修正中 | 🔄 | WP failed verification, being fixed | verification-report.md shows FAIL + diagnosis-report.md exists |
| 實作中 | 🔄 | WP implementation in progress | src/ exists but no verification-report.md |
| 待驗證 | ⏳ | Implementation done, needs verification | src/ exists but verification-report.md absent or stale |
| 失敗 | ❌ | Verification failed, no fix started | verification-report.md shows FAIL but no diagnosis |
| 待開始 | ⏳ | Not yet started | No src/ or implementation files |
| 未知 | ❓ | Cannot determine status | Edge case |

### Step 4: Collect Statistics

Calculate overall progress:

```bash
TOTAL_WP=${#WP_DATA[@]}
COMPLETED=$(echo "${WP_DATA[@]}" | grep -c "✅ 完成" || echo 0)
IN_PROGRESS=$(echo "${WP_DATA[@]}" | grep -c "🔄" || echo 0)
PENDING=$(echo "${WP_DATA[@]}" | grep -c "⏳" || echo 0)
FAILED=$(echo "${WP_DATA[@]}" | grep -c "❌" || echo 0)

COMPLETION_PCT=$(( COMPLETED * 100 / TOTAL_WP ))
```

### Step 5: Identify Problems

For WPs with failures or issues, extract details:

```bash
for wp_id in $FAILED_WPS; do
  WP_DIR="$WP_BASE_DIR/$wp_id"

  # Read diagnosis report
  if [ -f "$WP_DIR/diagnosis-report.md" ]; then
    # Extract problem summary
    PROBLEMS=$(grep "^### 問題 #" "$WP_DIR/diagnosis-report.md" | sed 's/### 問題 #[0-9]*: //')

    # Extract last fix attempt
    LAST_FIX=$(grep "^\[.*\]" "$WP_DIR/journal.md" | tail -1)

    # Store problem info
    PROBLEM_LIST+=("$wp_id|$PROBLEMS|$LAST_FIX")
  fi
done
```

### Step 6: Generate STATUS.md

Create or update: `work-packages/STATUS.md`

Use template structure:

```markdown
# Work Packages 狀態總覽

**最後更新**: [TIMESTAMP]
**功能**: [FEATURE_NAME]

---

## 📊 進度總覽

| 指標 | 數量 | 百分比 |
|------|------|--------|
| 總 WP 數 | [X] | 100% |
| ✅ 已完成 | [Y] | [P]% |
| 🔄 進行中 | [Z] | [P]% |
| ⏳ 待開始 | [W] | [P]% |
| ❌ 失敗 | [V] | [P]% |

**整體完成度**: [P]%

```
[進度條]
██████████░░░░░░░░░░ 50%
```

---

## 📋 WP 狀態詳情

| WP | 名稱 | 實作 | Verify | 修正次數 | 狀態 |
|----|------|------|--------|----------|------|
| WP001 | Login Feature | ✅ | ✅ | 2 | ✅ 完成 |
| WP002 | Register Feature | ✅ | ❌ | 1 | 🔄 修正中 |
| WP003 | Reset Password | ✅ | ⏳ | 0 | ⏳ 待驗證 |
| WP004 | Profile Feature | 🔄 | - | 0 | 🔄 實作中 |
| WP005 | Logout Feature | ⏳ | - | 0 | ⏳ 待開始 |
| WP006 | Session Mgmt | ⏳ | - | 0 | ⏳ 待開始 |

**圖例**:
- 實作: ✅ 完成 / 🔄 進行中 / ⏳ 未開始
- Verify: ✅ 通過 / ❌ 失敗 / ⏳ 待驗證 / - 尚未執行

---

## ⚠️  目前問題

### WP002 - Register Feature

- **狀態**: 🔄 修正中
- **診斷報告**: [work-packages/WP002/diagnosis-report.md](WP002/diagnosis-report.md)
- **問題**:
  - Extra field "username" not in spec
  - Missing validation on "email" field
- **最後修正**: 2025-01-15 16:15
- **待執行**: `/speckit.fix --wp WP002 --auto`

---

## 🎯 下一步行動

### 優先處理

1. **WP002 (修正中)**:
   ```bash
   /speckit.fix --wp WP002 --auto
   ```

2. **WP003 (待驗證)**:
   ```bash
   /speckit.verify --wp WP003
   ```

### 繼續實作

3. **WP004 (實作中)**:
   ```bash
   /speckit.implement WP004/task-002
   ```

4. **WP005 (待開始)**:
   ```bash
   /speckit.implement WP005/task-001
   ```

---

## 📈 完成的 WP

### ✅ WP001 - Login Feature

- **Verified**: 2025-01-15 15:45
- **Test Coverage**: 92%
- **修正次數**: 2
- **驗證報告**: [work-packages/WP001/verification-report.md](WP001/verification-report.md)
- **Status**: Ready for integration

---

## 📝 備註

- 總實作時間: 約 8 小時
- 平均每個 WP: 1.3 小時
- 最複雜的 WP: WP002 (3 次修正)

---

**生成工具**: SpecKit V2 - `/speckit.status`
**報告時間**: [TIMESTAMP]
```

### Step 7: Display Summary

Output to terminal:

```
📊 Work Package 狀態總覽

進度: ████████░░░░░░░░░░ 50% (3/6 WP 完成)

狀態統計:
├─ ✅ 已完成: 1 WP (17%)
├─ 🔄 進行中: 2 WP (33%)
├─ ⏳ 待開始: 3 WP (50%)
└─ ❌ 失敗: 0 WP (0%)

目前問題:
├─ WP002: Register Feature (修正中)
│  └─ 2 個問題待修正
└─ WP003: Reset Password (待驗證)

下一步:
1. 修正 WP002: /speckit.fix --wp WP002 --auto
2. 驗證 WP003: /speckit.verify --wp WP003
3. 繼續實作 WP004: /speckit.implement WP004/task-002

📋 詳細報告: work-packages/STATUS.md
```

### Step 8: Update Journal (Optional)

If updating integration/integration-journal.md:

```markdown
### [2025-01-15 17:00] 狀態檢查

**Action**: `/speckit.status`

**Overall Progress**: 50% (3/6 WP completed)

**WP Status**:
- ✅ Completed: WP001
- 🔄 In Progress: WP002 (fixing), WP004 (implementing)
- ⏳ Pending: WP003 (needs verification), WP005, WP006

**Next**: Fix WP002, verify WP003

---
```

## Execution: Mode 2 (Display Only)

```bash
/speckit.status --show
```

Display status in terminal without updating STATUS.md file:

```
📊 Work Package 狀態

WP001 (Login Feature):        ✅ 完成
WP002 (Register Feature):     🔄 修正中 (2 issues)
WP003 (Reset Password):       ⏳ 待驗證
WP004 (Profile Feature):      🔄 實作中
WP005 (Logout Feature):       ⏳ 待開始
WP006 (Session Management):   ⏳ 待開始

Overall: 17% complete (1/6 WP)
```

## Execution: Mode 3 (Filter)

```bash
/speckit.status --filter failed
```

Show only failed WPs:

```
❌ Failed Work Packages

WP002 - Register Feature
├─ Status: 🔄 修正中
├─ Failures: 2 issues
├─ Last fix: 2025-01-15 16:15
└─ Action: /speckit.fix --wp WP002

Total: 1 failed WP
```

Filters:
- `--filter completed`: Only show ✅ completed WPs
- `--filter failed`: Only show ❌ failed or 🔄 fixing WPs
- `--filter pending`: Only show ⏳ pending WPs
- `--filter in-progress`: Only show 🔄 in-progress WPs

## Execution: Mode 4 (Detailed)

```bash
/speckit.status --detailed
```

Include additional details:

```
📊 Work Package 詳細狀態

WP001 - Login Feature
├─ Status: ✅ 完成
├─ Implementation: ✅ Done (2025-01-15 14:30)
├─ Verification: ✅ Passed (2025-01-15 15:45)
├─ Test Coverage: 92% (statements), 88% (branches)
├─ Tasks: 5/5 completed
├─ Fix attempts: 2
├─ Time spent: ~2 hours
└─ Files: 12 files, 450 lines

WP002 - Register Feature
├─ Status: 🔄 修正中
├─ Implementation: ✅ Done (2025-01-15 15:00)
├─ Verification: ❌ Failed (2025-01-15 16:00)
├─ Issues: 2 (Extra field, Missing validation)
├─ Tasks: 4/4 completed
├─ Fix attempts: 1 (in progress)
├─ Last activity: 2025-01-15 16:15
└─ Files: 10 files, 380 lines

[... continue for all WPs]

Overall Statistics:
├─ Total WPs: 6
├─ Total files: 45
├─ Total lines: 1,850
├─ Average coverage: 87%
├─ Total time: ~8 hours
└─ Completion: 50%
```

## Status Report Formats

### Format 1: Markdown Table (Default)

```markdown
| WP | Name | Status |
|----|------|--------|
| WP001 | Login | ✅ 完成 |
| WP002 | Register | 🔄 修正中 |
```

### Format 2: JSON (for CI/CD)

```bash
/speckit.status --format json
```

Output:

```json
{
  "timestamp": "2025-01-15T17:00:00Z",
  "feature": "Authentication System",
  "overall": {
    "total": 6,
    "completed": 1,
    "in_progress": 2,
    "pending": 3,
    "failed": 0,
    "completion_pct": 17
  },
  "work_packages": [
    {
      "id": "WP001",
      "name": "Login Feature",
      "status": "completed",
      "implementation": "done",
      "verification": "passed",
      "fix_count": 2,
      "coverage": 92,
      "last_updated": "2025-01-15T15:45:00Z"
    },
    {
      "id": "WP002",
      "name": "Register Feature",
      "status": "fixing",
      "implementation": "done",
      "verification": "failed",
      "issues": ["Extra field username", "Missing validation"],
      "fix_count": 1,
      "last_updated": "2025-01-15T16:15:00Z"
    }
  ]
}
```

### Format 3: CSV (for spreadsheets)

```bash
/speckit.status --format csv
```

Output:

```csv
WP,Name,Status,Implementation,Verification,Fix_Count,Coverage,Last_Updated
WP001,Login Feature,completed,done,passed,2,92,2025-01-15T15:45:00Z
WP002,Register Feature,fixing,done,failed,1,0,2025-01-15T16:15:00Z
WP003,Reset Password,pending_verification,done,pending,0,0,2025-01-15T14:00:00Z
```

## Integration with Other Commands

### After /speckit.implement

```bash
/speckit.implement WP001/task-005
# → Implementation complete

/speckit.status
# → Updates WP001 status to "⏳ 待驗證"
```

### After /speckit.verify

```bash
/speckit.verify --wp WP001
# → Verification passes

/speckit.status
# → Updates WP001 status to "✅ 完成"
```

### After /speckit.fix

```bash
/speckit.fix --wp WP002 --auto
# → Fixes applied, verification passes

/speckit.status
# → Updates WP002 status to "✅ 完成"
```

## Automatic Status Updates

Optionally, automatically run `/speckit.status` after certain commands:

```bash
# In .claude/hooks/post-verify.sh
if [ "$?" -eq 0 ]; then
  echo "Updating status..."
  /speckit.status --show
fi
```

## Visualizations

### Progress Bar

```
Overall Progress
████████░░░░░░░░░░░░ 40% (2/5 WP)

WP001 ████████████████████ 100%
WP002 ████████████████████ 100%
WP003 ████████████░░░░░░░░ 60%
WP004 ██████░░░░░░░░░░░░░░ 30%
WP005 ░░░░░░░░░░░░░░░░░░░░ 0%
```

### Status Icons

```
📊 Status Overview

WP001  ✅✅✅  Login Feature (Completed)
WP002  ✅✅❌  Register Feature (Fixing, 2 issues)
WP003  ✅⏳⏳  Reset Password (Pending verification)
WP004  🔄⏳⏳  Profile Feature (Implementing)
WP005  ⏳⏳⏳  Logout Feature (Not started)

Legend:
✅ Implementation  ✅ Verification  ✅ Ready
```

## CI/CD Integration

Use status in CI pipelines:

```yaml
# .github/workflows/status-check.yml
name: WP Status Check

on: [push, pull_request]

jobs:
  status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check WP Status
        run: |
          /speckit.status --format json > status.json

      - name: Verify All WPs Complete
        run: |
          COMPLETION=$(jq '.overall.completion_pct' status.json)
          if [ "$COMPLETION" -lt 100 ]; then
            echo "❌ Not all WPs complete ($COMPLETION%)"
            exit 1
          fi

      - name: Upload Status Report
        uses: actions/upload-artifact@v2
        with:
          name: wp-status
          path: work-packages/STATUS.md
```

## Error Handling

- If no WPs found: WARN "No Work Packages found in work-packages/"
- If STATUS.md cannot be written: ERROR "Cannot write to STATUS.md"
- If WP directory corrupted: WARN "Cannot read WP###" + skip
- If verification report missing: Mark as "❓ 未知"

## Context for Status

User-provided context: $ARGUMENTS

Use this to:
- Filter specific WPs if requested
- Customize output format
- Include/exclude certain details

## Example Usage

### Check Status Regularly

```bash
# During development
/speckit.status --show

# Before integration
/speckit.status --filter completed
# → Shows which WPs are ready to integrate

# After verification
/speckit.status
# → Updates STATUS.md with latest results
```

### Share with Team

```bash
# Generate detailed report
/speckit.status --detailed

# Export to JSON for dashboard
/speckit.status --format json > dashboard-data.json

# Create CSV for project management
/speckit.status --format csv > project-status.csv
```

## Template References

Create new template: `.specify/templates/status-template.md`

```markdown
# Work Packages 狀態總覽

**最後更新**: {{TIMESTAMP}}
**功能**: {{FEATURE_NAME}}

## 📊 進度總覽

{{PROGRESS_STATS_TABLE}}

## 📋 WP 狀態詳情

{{WP_STATUS_TABLE}}

## ⚠️  目前問題

{{PROBLEM_LIST}}

## 🎯 下一步行動

{{NEXT_ACTIONS}}

## 📈 完成的 WP

{{COMPLETED_WP_LIST}}

---

**生成工具**: SpecKit V2 - `/speckit.status`
```

## Summary

`/speckit.status` provides comprehensive visibility into WP progress:

- **Scan** all WPs
- **Determine** status (completed, in-progress, failed, pending)
- **Generate** STATUS.md report
- **Display** summary in terminal
- **Track** progress over time
- **Identify** blockers and next actions
