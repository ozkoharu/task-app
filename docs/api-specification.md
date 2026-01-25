# API仕様書

## 概要

Tarkov Task Tracker のバックエンド API 仕様書。

- **ベースURL**: `http://localhost:8000/api`
- **プロトコル**: HTTP/HTTPS
- **フォーマット**: JSON

---

## 共通仕様

### リクエストヘッダー

| ヘッダー | 値 | 必須 | 説明 |
|---------|-----|------|------|
| Content-Type | application/json | POST/PUT時 | リクエストボディの形式 |
| Accept | application/json | No | レスポンス形式 |

### レスポンス形式

全てのレスポンスは JSON 形式で返却されます。

### エラーレスポンス

エラー時は以下の形式で返却されます。

```json
{
  "detail": "エラーメッセージ"
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 400 | リクエスト不正 |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/traders | トレーダー一覧取得 |
| GET | /api/traders/{trader_id} | トレーダー詳細取得 |
| GET | /api/tasks | タスク一覧取得 |
| GET | /api/tasks/{task_id} | タスク詳細取得 |
| GET | /api/items | アイテム一覧取得 |
| GET | /api/items/required | 必要アイテム一覧取得 |
| POST | /api/sync | データ同期（管理用） |
| GET | /api/health | ヘルスチェック |

---

## 1. トレーダー API

### 1.1 GET /api/traders

トレーダー一覧を取得します。

#### リクエスト

パラメータなし

#### レスポンス

**200 OK**

```json
{
  "traders": [
    {
      "id": "5a7c2eca46aef81a7ca2145d",
      "name": "Prapor",
      "image_url": "https://assets.tarkov.dev/prapor-icon.png",
      "task_count": 70
    },
    {
      "id": "5ac3b934156ae10c4430e83c",
      "name": "Therapist",
      "image_url": "https://assets.tarkov.dev/therapist-icon.png",
      "task_count": 65
    }
  ]
}
```

#### レスポンススキーマ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| traders | TraderSummary[] | トレーダー一覧 |

**TraderSummary**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | トレーダーID（tarkov.dev API の ID） |
| name | string | トレーダー名 |
| image_url | string \| null | トレーダー画像URL |
| task_count | integer | 担当タスク数 |

---

### 1.2 GET /api/traders/{trader_id}

トレーダー詳細を取得します。

#### リクエスト

**パスパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| trader_id | string | Yes | トレーダーID |

#### レスポンス

**200 OK**

```json
{
  "id": "5a7c2eca46aef81a7ca2145d",
  "name": "Prapor",
  "image_url": "https://assets.tarkov.dev/prapor-icon.png",
  "task_count": 70,
  "tasks": [
    {
      "id": "5c51aac186f77432ea65c552",
      "name": "Debut",
      "min_player_level": 1
    }
  ]
}
```

**404 Not Found**

```json
{
  "detail": "Trader not found"
}
```

---

## 2. タスク API

### 2.1 GET /api/tasks

タスク一覧を取得します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|------------|------|
| trader_id | string | No | - | トレーダーIDでフィルタ |
| search | string | No | - | タスク名で部分一致検索 |
| limit | integer | No | 100 | 取得件数上限（最大500） |
| offset | integer | No | 0 | 取得開始位置 |

#### レスポンス

**200 OK**

```json
{
  "tasks": [
    {
      "id": "5c51aac186f77432ea65c552",
      "name": "Debut",
      "trader": {
        "id": "5a7c2eca46aef81a7ca2145d",
        "name": "Prapor"
      },
      "min_player_level": 1,
      "wiki_link": "https://escapefromtarkov.fandom.com/wiki/Debut",
      "objectives": [
        {
          "id": "5c51aac186f77432ea65c553",
          "type": "kill",
          "description": "Eliminate 5 Scavs on any location",
          "item": null,
          "count": 5,
          "found_in_raid": false
        }
      ]
    },
    {
      "id": "5c51aac186f77432ea65c554",
      "name": "Shortage",
      "trader": {
        "id": "5ac3b934156ae10c4430e83c",
        "name": "Therapist"
      },
      "min_player_level": 1,
      "wiki_link": "https://escapefromtarkov.fandom.com/wiki/Shortage",
      "objectives": [
        {
          "id": "5c51aac186f77432ea65c555",
          "type": "giveItem",
          "description": "Hand over 4 Salewa first aid kits",
          "item": {
            "id": "544fb45d4bdc2dee738b4568",
            "name": "Salewa first aid kit",
            "image_url": "https://assets.tarkov.dev/544fb45d4bdc2dee738b4568-icon.png"
          },
          "count": 4,
          "found_in_raid": true
        }
      ]
    }
  ],
  "total": 400,
  "limit": 100,
  "offset": 0
}
```

#### レスポンススキーマ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| tasks | Task[] | タスク一覧 |
| total | integer | 全件数 |
| limit | integer | 取得件数上限 |
| offset | integer | 取得開始位置 |

**Task**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | タスクID |
| name | string | タスク名 |
| trader | TraderRef | トレーダー情報 |
| min_player_level | integer | 必要プレイヤーレベル |
| wiki_link | string \| null | Wiki リンク |
| objectives | TaskObjective[] | タスク目標一覧 |

**TraderRef**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | トレーダーID |
| name | string | トレーダー名 |

**TaskObjective**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 目標ID |
| type | string | 目標タイプ（後述） |
| description | string | 目標の説明 |
| item | ItemRef \| null | 必要アイテム（アイテム系目標の場合） |
| count | integer | 必要数 |
| found_in_raid | boolean | Found in Raid 必須か |

**ItemRef**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | アイテムID |
| name | string | アイテム名 |
| image_url | string \| null | アイテム画像URL |

**目標タイプ（type）一覧**

| タイプ | 説明 |
|--------|------|
| kill | 敵の殺害 |
| giveItem | アイテムの納品 |
| findItem | アイテムの発見 |
| plantItem | アイテムの設置 |
| mark | 場所のマーキング |
| visit | 場所への訪問 |
| extract | 脱出 |
| shoot | 射撃（特定条件） |
| skill | スキルレベル達成 |
| traderLevel | トレーダーレベル達成 |
| experience | 経験値獲得 |
| other | その他 |

---

### 2.2 GET /api/tasks/{task_id}

タスク詳細を取得します。

#### リクエスト

**パスパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| task_id | string | Yes | タスクID |

#### レスポンス

**200 OK**

```json
{
  "id": "5c51aac186f77432ea65c554",
  "name": "Shortage",
  "trader": {
    "id": "5ac3b934156ae10c4430e83c",
    "name": "Therapist",
    "image_url": "https://assets.tarkov.dev/therapist-icon.png"
  },
  "min_player_level": 1,
  "wiki_link": "https://escapefromtarkov.fandom.com/wiki/Shortage",
  "objectives": [
    {
      "id": "5c51aac186f77432ea65c555",
      "type": "giveItem",
      "description": "Hand over 4 Salewa first aid kits",
      "item": {
        "id": "544fb45d4bdc2dee738b4568",
        "name": "Salewa first aid kit",
        "image_url": "https://assets.tarkov.dev/544fb45d4bdc2dee738b4568-icon.png"
      },
      "count": 4,
      "found_in_raid": true
    }
  ]
}
```

**404 Not Found**

```json
{
  "detail": "Task not found"
}
```

---

## 3. アイテム API

### 3.1 GET /api/items

アイテム一覧を取得します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|------------|------|
| search | string | No | - | アイテム名で部分一致検索 |
| limit | integer | No | 100 | 取得件数上限（最大500） |
| offset | integer | No | 0 | 取得開始位置 |

#### レスポンス

**200 OK**

```json
{
  "items": [
    {
      "id": "544fb45d4bdc2dee738b4568",
      "name": "Salewa first aid kit",
      "image_url": "https://assets.tarkov.dev/544fb45d4bdc2dee738b4568-icon.png"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

---

### 3.2 GET /api/items/required

未完了タスクで必要なアイテムを集計して取得します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|------------|------|
| completed_task_ids | string | No | - | 完了済みタスクID（カンマ区切り） |

#### 使用例

```
GET /api/items/required
GET /api/items/required?completed_task_ids=task1,task2,task3
```

#### レスポンス

**200 OK**

```json
{
  "required_items": [
    {
      "item": {
        "id": "544fb45d4bdc2dee738b4568",
        "name": "Salewa first aid kit",
        "image_url": "https://assets.tarkov.dev/544fb45d4bdc2dee738b4568-icon.png"
      },
      "total_count": 4,
      "found_in_raid_required": true,
      "tasks": [
        {
          "id": "5c51aac186f77432ea65c554",
          "name": "Shortage",
          "trader_name": "Therapist",
          "count": 4,
          "found_in_raid": true
        }
      ]
    },
    {
      "item": {
        "id": "590c621186f774138d11ea29",
        "name": "Secure Flash drive",
        "image_url": "https://assets.tarkov.dev/590c621186f774138d11ea29-icon.png"
      },
      "total_count": 3,
      "found_in_raid_required": true,
      "tasks": [
        {
          "id": "5967530a86f77462ba22226b",
          "name": "What's on the flash drive?",
          "trader_name": "Skier",
          "count": 2,
          "found_in_raid": true
        },
        {
          "id": "5969f90786f77420d2328f52",
          "name": "Friend from the West - Part 1",
          "trader_name": "Skier",
          "count": 1,
          "found_in_raid": true
        }
      ]
    }
  ]
}
```

#### レスポンススキーマ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| required_items | RequiredItem[] | 必要アイテム一覧 |

**RequiredItem**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| item | ItemRef | アイテム情報 |
| total_count | integer | 合計必要数 |
| found_in_raid_required | boolean | いずれかのタスクでFiR必須か |
| tasks | TaskRequirement[] | このアイテムを使うタスク一覧 |

**TaskRequirement**

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | タスクID |
| name | string | タスク名 |
| trader_name | string | トレーダー名 |
| count | integer | このタスクでの必要数 |
| found_in_raid | boolean | FiR必須か |

---

## 4. 同期 API

### 4.1 POST /api/sync

Tarkov.dev API からデータを同期します（管理用）。

#### リクエスト

ボディなし

#### レスポンス

**200 OK**

```json
{
  "status": "success",
  "synced": {
    "traders": 11,
    "tasks": 400,
    "items": 150,
    "objectives": 1200
  },
  "synced_at": "2024-01-15T10:30:00Z"
}
```

**500 Internal Server Error**

```json
{
  "detail": "Failed to sync data from Tarkov.dev API",
  "error": "Connection timeout"
}
```

---

## 5. ヘルスチェック API

### 5.1 GET /api/health

サーバーの稼働状態を確認します。

#### リクエスト

パラメータなし

#### レスポンス

**200 OK**

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

**503 Service Unavailable**

```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "version": "1.0.0"
}
```

---

## OpenAPI 3.0 スキーマ

```yaml
openapi: 3.0.3
info:
  title: Tarkov Task Tracker API
  description: Escape from Tarkov タスク進捗管理 API
  version: 1.0.0

servers:
  - url: http://localhost:8000/api
    description: 開発環境

paths:
  /traders:
    get:
      summary: トレーダー一覧取得
      tags:
        - Traders
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TradersResponse'

  /traders/{trader_id}:
    get:
      summary: トレーダー詳細取得
      tags:
        - Traders
      parameters:
        - name: trader_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TraderDetail'
        '404':
          description: Not Found

  /tasks:
    get:
      summary: タスク一覧取得
      tags:
        - Tasks
      parameters:
        - name: trader_id
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TasksResponse'

  /tasks/{task_id}:
    get:
      summary: タスク詳細取得
      tags:
        - Tasks
      parameters:
        - name: task_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskDetail'
        '404':
          description: Not Found

  /items:
    get:
      summary: アイテム一覧取得
      tags:
        - Items
      parameters:
        - name: search
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ItemsResponse'

  /items/required:
    get:
      summary: 必要アイテム一覧取得
      tags:
        - Items
      parameters:
        - name: completed_task_ids
          in: query
          description: 完了済みタスクID（カンマ区切り）
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequiredItemsResponse'

  /sync:
    post:
      summary: データ同期
      tags:
        - Admin
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SyncResponse'
        '500':
          description: 同期失敗

  /health:
    get:
      summary: ヘルスチェック
      tags:
        - System
      responses:
        '200':
          description: 正常
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

components:
  schemas:
    TraderSummary:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        image_url:
          type: string
          nullable: true
        task_count:
          type: integer

    TradersResponse:
      type: object
      properties:
        traders:
          type: array
          items:
            $ref: '#/components/schemas/TraderSummary'

    TraderDetail:
      allOf:
        - $ref: '#/components/schemas/TraderSummary'
        - type: object
          properties:
            tasks:
              type: array
              items:
                $ref: '#/components/schemas/TaskSummary'

    TaskSummary:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        min_player_level:
          type: integer

    TraderRef:
      type: object
      properties:
        id:
          type: string
        name:
          type: string

    ItemRef:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        image_url:
          type: string
          nullable: true

    TaskObjective:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        description:
          type: string
        item:
          $ref: '#/components/schemas/ItemRef'
          nullable: true
        count:
          type: integer
        found_in_raid:
          type: boolean

    Task:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        trader:
          $ref: '#/components/schemas/TraderRef'
        min_player_level:
          type: integer
        wiki_link:
          type: string
          nullable: true
        objectives:
          type: array
          items:
            $ref: '#/components/schemas/TaskObjective'

    TaskDetail:
      allOf:
        - $ref: '#/components/schemas/Task'

    TasksResponse:
      type: object
      properties:
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        total:
          type: integer
        limit:
          type: integer
        offset:
          type: integer

    ItemsResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/ItemRef'
        total:
          type: integer
        limit:
          type: integer
        offset:
          type: integer

    TaskRequirement:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        trader_name:
          type: string
        count:
          type: integer
        found_in_raid:
          type: boolean

    RequiredItem:
      type: object
      properties:
        item:
          $ref: '#/components/schemas/ItemRef'
        total_count:
          type: integer
        found_in_raid_required:
          type: boolean
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/TaskRequirement'

    RequiredItemsResponse:
      type: object
      properties:
        required_items:
          type: array
          items:
            $ref: '#/components/schemas/RequiredItem'

    SyncResponse:
      type: object
      properties:
        status:
          type: string
        synced:
          type: object
          properties:
            traders:
              type: integer
            tasks:
              type: integer
            items:
              type: integer
            objectives:
              type: integer
        synced_at:
          type: string
          format: date-time

    HealthResponse:
      type: object
      properties:
        status:
          type: string
        database:
          type: string
        version:
          type: string
```

---

## フロントエンドからの利用例

### タスク一覧の取得

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchTasks(options?: {
  traderId?: string;
  search?: string;
}): Promise<TasksResponse> {
  const params = new URLSearchParams();
  if (options?.traderId) params.set('trader_id', options.traderId);
  if (options?.search) params.set('search', options.search);

  const response = await fetch(`${API_BASE}/tasks?${params}`);
  return response.json();
}
```

### 必要アイテムの取得（完了タスクを除外）

```typescript
export async function fetchRequiredItems(
  completedTaskIds: string[]
): Promise<RequiredItemsResponse> {
  const params = new URLSearchParams();
  if (completedTaskIds.length > 0) {
    params.set('completed_task_ids', completedTaskIds.join(','));
  }

  const response = await fetch(`${API_BASE}/items/required?${params}`);
  return response.json();
}
```
