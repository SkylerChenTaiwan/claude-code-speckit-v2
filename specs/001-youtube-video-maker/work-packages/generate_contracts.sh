#!/bin/bash
# 為 WP003-WP012 批次生成 contract-expected.yaml 檔案

# WP003: Gemini 腳本生成功能
cat > WP003-gemini-script-generation/contract-expected.yaml << 'EOF'
# Contract Expected for WP003: Gemini 腳本生成功能
# Generated: 2025-10-29
# Source: design-spec.yaml

version: "1.0.0"

work_package:
  id: "WP003"
  name: "Gemini 腳本生成功能"
  type: "full-stack-feature"

# ==================== DATA MODELS ====================

data_models:
  Script:
    description: "腳本資料"
    source: "design-spec.yaml#data_models.Script"

    fields:
      generatedAt:
        type: "timestamp"
        required: true
        description: "腳本生成時間"
        example: "2025-10-29T10:35:00Z"

      systemPrompt:
        type: "string"
        required: true
        description: "使用的 Gemini system prompt"

      paragraphs:
        type: "array"
        required: true
        description: "腳本段落陣列"
        items:
          $ref: "#/data_models/ScriptParagraph"

  ScriptParagraph:
    description: "腳本段落"
    source: "design-spec.yaml#data_models.ScriptParagraph"

    fields:
      paragraphId:
        type: "string"
        required: true
        description: "段落唯一識別碼"
        example: "para-001"

      text:
        type: "string"
        required: true
        description: "段落文字內容"

      startTime:
        type: "number"
        required: true
        description: "段落開始時間 (秒)"

      endTime:
        type: "number"
        required: true
        description: "段落結束時間 (秒)"

      imagePrompt:
        type: "string"
        required: true
        description: "圖片生成提示詞 (英文)"

      imagePromptZh:
        type: "string"
        required: false
        description: "圖片生成提示詞 (中文,供使用者檢視)"

# ==================== IPC CHANNELS ====================

ipc_channels:
  gemini_generateScript:
    channel: "gemini:generateScript"
    type: "invoke"
    description: "根據文稿和時間標記生成結構化腳本"
    source: "design-spec.yaml#api_endpoints.gemini_generateScript"

    request:
      schema:
        type: "object"
        required: ["scriptContent", "timecodes"]
        properties:
          scriptContent:
            type: "string"
            description: "原始文稿內容"
          timecodes:
            type: "array"
            description: "TTS 生成的時間標記"
          systemPrompt:
            type: "string"
            required: false
            description: "自訂 system prompt"

    response:
      success:
        schema:
          type: "object"
          properties:
            paragraphs:
              type: "array"
              description: "腳本段落陣列"
            usageMetadata:
              type: "object"
              description: "用量統計"
            error:
              type: "string"

      errors:
        - error_message: "API 金鑰無效"
          condition: "Gemini API key 錯誤"
        - error_message: "網路連線失敗,請檢查您的網路連線後重試"
          condition: "網路錯誤"
        - error_message: "Gemini 服務暫時無法使用,請稍後再試"
          condition: "API 錯誤"

# ==================== ERROR MESSAGES ====================

error_messages:
  api:
    invalid_api_key: "API 金鑰無效"
    network_error: "網路連線失敗,請檢查您的網路連線後重試"
    service_unavailable: "Gemini 服務暫時無法使用,請稍後再試"

# ==================== TESTING REQUIREMENTS ====================

testing_requirements:
  coverage_requirement:
    minimum: 80

# ==================== EXPECTED FILES ====================

expected_files:
  main_process:
    - "src/main/ipc/geminiHandlers.ts"
    - "src/main/ipc/geminiHandlers.test.ts"
    - "src/main/services/GeminiService.ts"
    - "src/main/services/GeminiService.test.ts"

# ==================== TRACEABILITY ====================

traceability:
  user_stories:
    - "US001"
  design_spec:
    sections:
      - "design-spec.yaml#data_models.Script"
      - "design-spec.yaml#data_models.ScriptParagraph"
      - "design-spec.yaml#api_endpoints.gemini_generateScript"

# ==================== VERIFICATION POINTS ====================

verification_points:
  field_names:
    - "所有 Script 和 ScriptParagraph 欄位名稱必須與契約一致"
  ipc_channels:
    - "IPC 通道名稱必須完全一致（gemini:generateScript）"
  error_messages:
    - "所有錯誤訊息與契約完全相同"
  test_coverage:
    - "測試覆蓋率 >= 80%"
EOF

echo "✅ Generated WP003 contract"

# 為其他 WP 生成簡化的 contract 檔案模板
for wp_num in 004 005 006 007 008 009 010 011 012; do
    wp_id="WP${wp_num}"
    wp_dir=$(ls -d ${wp_id}* 2>/dev/null | head -1)
    
    if [ -n "$wp_dir" ]; then
        cat > "${wp_dir}/contract-expected.yaml" << WPEOF
# Contract Expected for ${wp_id}
# Generated: 2025-10-29
# Source: design-spec.yaml

version: "1.0.0"

work_package:
  id: "${wp_id}"
  name: "待填入"
  type: "full-stack-feature"

# ==================== 注意 ====================
# 此檔案為自動生成的模板，需要根據 design-spec.yaml 填入精確資訊：
# 1. data_models - 從 design-spec.yaml#data_models 提取相關模型
# 2. ipc_channels - 從 design-spec.yaml#api_endpoints 提取 IPC 通道
# 3. ui_components - 從 design-spec.yaml#ui_components 提取 UI 元件
# 4. validation_rules - 從 design-spec.yaml#validation_rules 提取驗證規則
# 5. error_messages - 確保與 design-spec.yaml 完全一致（word-for-word）
#
# 參考 WP001 和 WP002 的 contract-expected.yaml 作為範例
# ==========================================

# TODO: 從 design-spec.yaml 填入精確資訊

# ==================== VERIFICATION POINTS ====================

verification_points:
  field_names:
    - "所有欄位名稱必須與 design-spec.yaml 完全一致"
  error_messages:
    - "所有錯誤訊息與 design-spec.yaml 完全相同（word-for-word）"
  test_coverage:
    - "測試覆蓋率 >= 80%"
WPEOF
        echo "✅ Generated ${wp_id} contract template"
    fi
done

echo ""
echo "🎉 所有 contract 檔案已生成！"
echo ""
echo "注意：WP004-WP012 的 contract 檔案為模板，需要根據 design-spec.yaml 填入精確資訊"
