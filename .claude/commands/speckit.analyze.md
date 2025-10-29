---
description: 分析所有 Work Packages，找出重複元件、工具函數和命名衝突。
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

此指令掃描所有已完成的 Work Packages，分析:
- 重複的 UI 元件（Button, Input, Card 等）
- 重複的工具函數（formatDate, validateEmail 等）
- 命名衝突（不同 WP 有同名但不同實作）
- API 路徑衝突
- 相依性分析

這是整合階段的第一步，為 `/speckit.integrate` 提供決策依據。

## Execution Steps

### Step 1: Setup and Prerequisites

```bash
# Run prerequisite check
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
```

Parse JSON output for:
- `FEATURE_DIR`: The feature directory path

**Check prerequisites**:
- `FEATURE_DIR/work-packages/` must exist
- At least 2 Work Packages must exist
- All Work Packages must have passed verification (check for `verification-report.md` with ✅ PASS status)

### Step 2: Scan All Work Packages

掃描 `work-packages/` 目錄下的所有 WP:

```bash
ls -d work-packages/WP*/
```

For each Work Package:
1. Read `README.md` to understand what it implements
2. Read `contract-expected.yaml` to understand its API contracts
3. Scan implementation files to find components and utilities

### Step 3: Analyze Components

#### Step 3.1: Find All Components

搜尋所有 WP 中的元件檔案:

```bash
# For TypeScript/React projects
find work-packages/WP*/  -name "*.tsx" -o -name "*.jsx"

# For Vue projects
find work-packages/WP*/ -name "*.vue"

# For Python projects
find work-packages/WP*/ -name "*_component.py"
```

#### Step 3.2: Calculate Similarity

For each component name that appears in multiple WPs:

**Compare**:
1. **Props/Interface**: Props 結構是否相同？
2. **Functionality**: 功能是否相同？
3. **Code structure**: 程式碼結構是否相似？
4. **Type definitions**: TypeScript types 是否相同？

**Similarity Score**:
```
Similarity = (
  0.3 * props_similarity +
  0.4 * functionality_similarity +
  0.2 * structure_similarity +
  0.1 * types_similarity
)
```

**Classification**:
- **≥ 90%**: 自動合併（Auto-merge）
- **60-89%**: 需要人工決策（Manual decision）
- **< 60%**: 不合併，但需要重新命名避免衝突

### Step 4: Analyze Utility Functions

#### Step 4.1: Find All Utility Functions

搜尋所有 utils 目錄:

```bash
find work-packages/WP*/ -path "*/utils/*" -type f
```

#### Step 4.2: Calculate Similarity

For each function name that appears in multiple WPs:

**Compare**:
1. **Function signature**: 參數和回傳值是否相同？
2. **Implementation logic**: 實作邏輯是否相同？
3. **Dependencies**: 相依性是否相同？

**Exact match** (100% similarity):
- 函數簽名相同
- 實作邏輯相同
- 無額外相依性

**Classification** (same as components):
- ≥ 90%: Auto-merge
- 60-89%: Manual decision
- < 60%: Keep separate

### Step 5: Detect Naming Conflicts

For each file/component name that appears in multiple WPs:

**Check**:
1. Are they different implementations with the same name?
2. What's the similarity score?

**If similarity < 60%**:
- This is a naming conflict
- Suggest renaming strategy

**Renaming Strategy**:
```
原名稱: FormValidator
WP001: LoginFormValidator
WP002: RegisterFormValidator

原名稱: ApiClient
WP004: AuthApiClient
WP005: UserApiClient
```

### Step 6: Check API Path Conflicts

Extract all API endpoints from all WPs:

**From contract-expected.yaml**:
```yaml
api_endpoints:
  - path: "/api/auth/login"
    method: "POST"
```

**Build a map**:
```
{
  "POST /api/auth/login": ["WP001"],
  "POST /api/auth/register": ["WP002"],
  "GET /api/users/profile": ["WP004"]
}
```

**If any path appears in multiple WPs**:
- This is a conflict (unless it's intentional duplication)
- Report as error

### Step 7: Load Analysis Template

Read the template:
```bash
cat .specify/templates/integration-analysis-template.md
```

### Step 8: Generate Analysis Report

Using the template, create `FEATURE_DIR/integration/integration-analysis.md`:

Fill in:
1. **自動合併項目表格**:
   - List all components/functions with similarity ≥ 90%
   - Provide merge strategy

2. **需要人工決策表格**:
   - List items with 60% ≤ similarity < 90%
   - Provide options (merge vs keep separate)

3. **命名衝突表格**:
   - List items with same name but similarity < 60%
   - Suggest renaming

4. **API 路徑檢查**:
   - Report any conflicts

5. **詳細分析** (for human review):
   - Detailed comparison for each item
   - Code snippets
   - Similarity breakdown

### Step 9: Generate Integration Plan

Based on analysis, generate a suggested integration plan:

**Phase 1: Auto-merge** (no human input needed)
```
- Merge Button (4 → 1)
- Merge formatDate (3 → 1)
- Resolve FormValidator conflict (rename)
```

**Phase 2: Manual decisions** (need human choice)
```
- Card component: Merge or keep separate?
- validateInput: Merge or keep separate?
```

### Step 10: Report

Output to user:

```
整合分析完成

📊 統計:
- 掃描的 Work Packages: 6
- 發現的重複元件: 5
- 發現的重複工具函數: 3
- 發現的命名衝突: 2
- API 路徑衝突: 0

📋 分類:
- 可自動合併: 7 項
- 需要人工決策: 2 項
- 需要重新命名: 2 項

📁 報告位置:
integration/integration-analysis.md

下一步:
1. 查看報告，決定需要人工決策的項目
2. 執行 /speckit.integrate --dry-run 預覽整合
3. 執行 /speckit.integrate --full 進行整合
```

## Guidelines

### Component Similarity Detection

**For React/TypeScript**:
```typescript
// Component 1 (WP001)
interface ButtonProps {
  type: 'primary' | 'secondary';
  onClick: () => void;
}

// Component 2 (WP002)
interface ButtonProps {
  type: 'primary' | 'secondary';
  onClick: () => void;
  loading?: boolean;  // ← 多了這個
}

// Similarity: 90% (almost identical, just one extra prop)
```

**For Python**:
```python
# Component 1 (WP001)
class Button:
    def __init__(self, type: str, on_click: Callable):
        self.type = type
        self.on_click = on_click

# Component 2 (WP002)
class Button:
    def __init__(self, type: str, on_click: Callable, loading: bool = False):
        self.type = type
        self.on_click = on_click
        self.loading = loading

# Similarity: 90%
```

### Naming Conflict Detection

**Conflict criteria**:
- Same name
- Different package/directory
- Similarity < 60%
- Different purpose

**Not a conflict** (just duplication):
- Same name
- Similarity ≥ 60%
- Same purpose

### API Path Conflict

**Conflict**:
```
WP001: POST /api/auth/login
WP002: POST /api/auth/login  ← Same path, different implementation
```

**Not a conflict** (intentional duplication for testing):
```
WP001: POST /api/auth/login (implementation)
WP006: POST /api/auth/login (frontend calling it)
```

## Error Handling

- If no Work Packages found: ERROR "No Work Packages found. Run /speckit.breakdown first"
- If less than 2 WPs: WARN "Only 1 Work Package found. Integration not needed"
- If any WP hasn't passed verification: WARN "WP### hasn't passed verification. Analysis may be incomplete"
- If unable to calculate similarity: WARN "Manual review needed for [component name]"

## Context for Analysis

User-provided context: $ARGUMENTS

Use this context to guide analysis (e.g., "focus on UI components", "ignore backend utilities", "be conservative with merging").
