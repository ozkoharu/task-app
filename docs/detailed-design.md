# 詳細設計書

## システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント（ブラウザ）                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Next.js フロントエンド                     │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────────┐ │   │
│  │  │ タスク一覧  │ │ 進捗Dashboard│ │ 必要アイテム一覧     │ │   │
│  │  └───────────┘ └───────────┘ └───────────────────────┘ │   │
│  │                       │                                   │   │
│  │              ┌────────┴────────┐                         │   │
│  │              │  localStorage   │                         │   │
│  │              │ (進捗データ保存)  │                         │   │
│  │              └─────────────────┘                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose 環境                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 FastAPI バックエンド                       │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────────┐ │   │
│  │  │ /api/tasks │ │/api/traders│ │ /api/items           │ │   │
│  │  └───────────┘ └───────────┘ └───────────────────────┘ │   │
│  │                       │                                   │   │
│  │              ┌────────┴────────┐                         │   │
│  │              │   SQLAlchemy    │                         │   │
│  │              └────────┬────────┘                         │   │
│  └───────────────────────┼─────────────────────────────────┘   │
│                          │                                      │
│  ┌───────────────────────▼─────────────────────────────────┐   │
│  │                   PostgreSQL                             │   │
│  │  ┌─────────┐ ┌─────────┐ ┌──────┐ ┌────────────────┐   │   │
│  │  │ traders │ │  tasks  │ │items │ │ task_objectives │   │   │
│  │  └─────────┘ └─────────┘ └──────┘ └────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ 初期データ取得（バッチ）
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Tarkov.dev GraphQL API                        │
│                   https://api.tarkov.dev/graphql                │
└─────────────────────────────────────────────────────────────────┘
```

## データベース設計

### ER図

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   traders   │       │      tasks      │       │    items    │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)         │   ┌──►│ id (PK)     │
│ name        │   └───│ trader_id (FK)  │   │   │ name        │
│ image_url   │       │ name            │   │   │ image_url   │
└─────────────┘       │ min_player_level│   │   └─────────────┘
                      │ wiki_link       │   │
                      └────────┬────────┘   │
                               │            │
                               │ 1:N        │
                               ▼            │
                      ┌─────────────────┐   │
                      │ task_objectives │   │
                      ├─────────────────┤   │
                      │ id (PK)         │   │
                      │ task_id (FK)    │   │
                      │ type            │   │
                      │ description     │   │
                      │ item_id (FK)    │───┘
                      │ count           │
                      │ found_in_raid   │
                      └─────────────────┘
```

### テーブル定義

#### traders テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(50) | PRIMARY KEY | tarkov.dev API の ID |
| name | VARCHAR(100) | NOT NULL | トレーダー名 |
| image_url | VARCHAR(500) | | トレーダー画像URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

#### tasks テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(50) | PRIMARY KEY | tarkov.dev API の ID |
| trader_id | VARCHAR(50) | FOREIGN KEY | トレーダーID |
| name | VARCHAR(200) | NOT NULL | タスク名 |
| min_player_level | INTEGER | DEFAULT 1 | 必要プレイヤーレベル |
| wiki_link | VARCHAR(500) | | Wiki リンク |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

#### items テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(50) | PRIMARY KEY | tarkov.dev API の ID |
| name | VARCHAR(200) | NOT NULL | アイテム名 |
| image_url | VARCHAR(500) | | アイテム画像URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

#### task_objectives テーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | VARCHAR(50) | PRIMARY KEY | tarkov.dev API の ID |
| task_id | VARCHAR(50) | FOREIGN KEY | タスクID |
| type | VARCHAR(50) | NOT NULL | 目標タイプ |
| description | TEXT | | 目標の説明 |
| item_id | VARCHAR(50) | FOREIGN KEY, NULLABLE | 必要アイテムID |
| count | INTEGER | DEFAULT 1 | 必要数 |
| found_in_raid | BOOLEAN | DEFAULT FALSE | FiR必須か |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

## API設計

### バックエンド API（FastAPI）

#### GET /api/traders

トレーダー一覧を取得

**レスポンス:**
```json
{
  "traders": [
    {
      "id": "prapor",
      "name": "Prapor",
      "image_url": "https://...",
      "task_count": 70
    }
  ]
}
```

#### GET /api/tasks

タスク一覧を取得

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| trader_id | string | No | トレーダーでフィルタ |
| search | string | No | タスク名で検索 |

**レスポンス:**
```json
{
  "tasks": [
    {
      "id": "task_123",
      "name": "Debut",
      "trader": {
        "id": "prapor",
        "name": "Prapor"
      },
      "min_player_level": 1,
      "objectives": [
        {
          "id": "obj_1",
          "type": "kill",
          "description": "Kill 5 Scavs",
          "item": null,
          "count": 5,
          "found_in_raid": false
        }
      ]
    }
  ]
}
```

#### GET /api/tasks/{task_id}

タスク詳細を取得

**レスポンス:**
```json
{
  "id": "task_123",
  "name": "Debut",
  "trader": {
    "id": "prapor",
    "name": "Prapor"
  },
  "min_player_level": 1,
  "wiki_link": "https://wikiwiki.jp/eft/...",
  "objectives": [...]
}
```

#### GET /api/items/required

未完了タスクに必要なアイテム一覧を取得

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| completed_task_ids | string | No | 完了済みタスクID（カンマ区切り） |

**レスポンス:**
```json
{
  "required_items": [
    {
      "item": {
        "id": "item_salewa",
        "name": "Salewa",
        "image_url": "https://..."
      },
      "total_count": 4,
      "found_in_raid_required": true,
      "tasks": [
        {
          "id": "task_shortage",
          "name": "Shortage",
          "trader_name": "Therapist",
          "count": 4
        }
      ]
    }
  ]
}
```

#### POST /api/sync

Tarkov.dev API からデータを同期（管理用）

**レスポンス:**
```json
{
  "status": "success",
  "synced": {
    "traders": 11,
    "tasks": 400,
    "items": 150
  }
}
```

## フロントエンド設計

### ページ構成

```
/                       # トップ（ダッシュボード）
/tasks                  # タスク一覧
/tasks/[traderId]       # トレーダー別タスク一覧
/items                  # 必要アイテム一覧
```

### コンポーネント構成

```
src/
├── app/
│   ├── layout.tsx              # 共通レイアウト
│   ├── page.tsx                # ダッシュボード
│   ├── tasks/
│   │   ├── page.tsx            # タスク一覧
│   │   └── [traderId]/
│   │       └── page.tsx        # トレーダー別タスク
│   └── items/
│       └── page.tsx            # 必要アイテム一覧
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # ヘッダー
│   │   ├── Navigation.tsx      # ナビゲーション
│   │   └── Footer.tsx          # フッター
│   ├── dashboard/
│   │   ├── OverallProgress.tsx # 全体進捗率
│   │   └── TraderProgress.tsx  # トレーダー別進捗
│   ├── tasks/
│   │   ├── TaskList.tsx        # タスク一覧
│   │   ├── TaskItem.tsx        # タスク行
│   │   ├── TaskCheckbox.tsx    # 完了チェックボックス
│   │   └── TaskFilter.tsx      # フィルター
│   └── items/
│       ├── RequiredItemList.tsx # 必要アイテム一覧
│       └── RequiredItemRow.tsx  # アイテム行
├── hooks/
│   ├── useProgress.ts          # 進捗管理（localStorage）
│   ├── useTasks.ts             # タスクデータ取得
│   └── useRequiredItems.ts     # 必要アイテム取得
├── lib/
│   ├── api.ts                  # APIクライアント
│   └── storage.ts              # localStorage操作
└── types/
    └── index.ts                # 型定義
```

### 状態管理

#### localStorage スキーマ

```typescript
// キー: "tarkov-progress"
interface ProgressData {
  completedTaskIds: string[];
  updatedAt: string; // ISO 8601
}
```

#### useProgress フック

```typescript
interface UseProgressReturn {
  completedTaskIds: string[];
  isCompleted: (taskId: string) => boolean;
  toggleTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  clearAll: () => void;
}
```

### 画面詳細

#### ダッシュボード（/）

| 要素 | 説明 |
|-----|------|
| 全体進捗バー | 完了タスク数 / 全タスク数（%） |
| トレーダー別進捗 | 各トレーダーの進捗率とプログレスバー |
| クイックアクセス | タスク一覧・必要アイテムへのリンク |

#### タスク一覧（/tasks）

| 要素 | 説明 |
|-----|------|
| トレーダーフィルター | ドロップダウンでトレーダー選択 |
| 検索ボックス | タスク名で検索 |
| ステータスフィルター | 全て / 未完了 / 完了済み |
| タスクリスト | チェックボックス付きタスク一覧 |

#### 必要アイテム一覧（/items）

| 要素 | 説明 |
|-----|------|
| アイテムリスト | アイテム名、必要数、FiR、使用タスク |
| 展開詳細 | クリックでどのタスクで使うか表示 |

## データ同期フロー

### 初期データ投入

```
1. docker compose up 実行
2. backend コンテナ起動時に alembic upgrade head（マイグレーション）
3. 管理者が POST /api/sync を実行
4. バックエンドが Tarkov.dev GraphQL API にクエリ送信
5. レスポンスを解析して DB に INSERT/UPDATE
```

### Tarkov.dev GraphQL クエリ

```graphql
{
  traders {
    id
    name
    imageLink
  }
  tasks {
    id
    name
    trader {
      id
    }
    minPlayerLevel
    wikiLink
    objectives {
      id
      type
      description
      ... on TaskObjectiveItem {
        item {
          id
          name
          imageLink
        }
        count
        foundInRaid
      }
    }
  }
}
```

## ディレクトリ構成（全体）

```
/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── traders.py
│   │   │   ├── tasks.py
│   │   │   ├── items.py
│   │   │   └── sync.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── trader.py
│   │   │   ├── task.py
│   │   │   ├── item.py
│   │   │   └── task_objective.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── trader.py
│   │   │   ├── task.py
│   │   │   └── item.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── tarkov_api.py
│   │   ├── db.py
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/
│   ├── alembic/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── docs/
│   ├── requirements.md
│   └── detailed-design.md
└── CLAUDE.md
```
