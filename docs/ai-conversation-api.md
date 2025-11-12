# AI 对话表接口说明

所有接口位于 `ai_conversation` 控制器下，返回值统一为 `AjaxResult`，`code=200` 表示成功，`data` 字段携带业务数据。接口默认需要已登录用户，用户 ID 由后端通过 `StpUtil` 获取。

表结构字段：

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| id | 主键 ID | Long |
| conversationId | 对话唯一标识 | 系统默认生成 32 位字符串 |
| userId | 用户 ID | 由后端自动注入 |
| title | 对话标题 | 为空时使用“默认对话” |
| questionId | 关联题目 ID | 可为空 |
| messageCount | 消息数量 | 默认 0，不允许负数 |
| createTime / updateTime | 创建 / 更新时间 | 自动维护 |

## 1. 新建对话

- **URL**：`POST /ai/conversation`
- **Body（JSON）**：
  ```json
  {
    "title": "错题巩固",
    "questionId": "1234567890",
    "messageCount": 2
  }
  ```
- **说明**：
  - `conversationId`、`userId`、`createTime`、`updateTime` 由系统生成。
  - `title` 为空或缺省时使用“默认对话”。
  - `messageCount` 缺省或小于 0 时记为 0。
- **返回**：
  ```json
  {
    "code": 200,
    "msg": "操作成功",
    "data": {
      "id": "1",
      "conversationId": "c0b8f5b4f7b54a9b9e0e90bf2a7a93f1",
      "userId": "189000000000000000",
      "title": "错题巩固",
      "questionId": "1234567890",
      "messageCount": 2,
      "createTime": "2025-01-12 10:00:00",
      "updateTime": "2025-01-12 10:00:00"
    }
  }
  ```

## 2. 对话列表

- **URL**：`GET /ai/conversation/list`
- **Query 参数**：
  - `title`（可选）：标题模糊匹配。
  - `questionId`（可选）：指定题目 ID。
- **返回**：`data` 为当前用户的对话数组，按 `updateTime` 倒序。

## 3. 对话详情

- **URL**：`GET /ai/conversation/{conversationId}`
- **说明**：`conversationId` 为唯一字符串标识。仅可查询当前用户的数据。
- **返回**：单条对话对象。

## 4. 更新对话

- **URL**：`PUT /ai/conversation/{conversationId}`
- **Body（JSON）**：
  ```json
  {
    "title": "新的标题",
    "questionId": "9876543210",
    "messageCount": 10
  }
  ```
- **说明**：
  - 仅更新 Body 中出现的字段。
  - `title` 传空字符串会重置为“默认对话”。
  - `questionId` 传空字符串会被清空。
  - `messageCount` 小于 0 时按 0 处理。

## 5. 删除对话

- **URL**：`DELETE /ai/conversation/{conversationId}`
- **说明**：删除当前用户指定的对话记录。

---

以上接口均已在 `AiConversationController` 中实现，可直接在前端调用。若需要分页，只需在 `listConversations` 方法上拓展分页查询即可。
