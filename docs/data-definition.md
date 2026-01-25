# データ定義書

## 概要

Tarkov Task Tracker のデータベース設計およびデータ定義。

- **DBMS**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0
- **マイグレーション**: Alembic

---

## ER図

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     traders     │       │        tasks        │       │      items      │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)             │   ┌──►│ id (PK)         │
│ name            │   └───│ trader_id (FK)      │   │   │ name            │
│ image_url       │       │ name                │   │   │ image_url       │
│ created_at      │       │ min_player_level    │   │   │ created_at      │
│ updated_at      │       │ wiki_link           │   │   │ updated_at      │
└─────────────────┘       │ created_at          │   │   └─────────────────┘
                          │ updated_at          │   │
                          └──────────┬──────────┘   │
                                     │              │
                                     │ 1:N          │
                                     ▼              │
                          ┌─────────────────────┐   │
                          │   task_objectives   │   │
                          ├─────────────────────┤   │
                          │ id (PK)             │   │
                          │ task_id (FK)        │   │
                          │ type                │   │
                          │ description         │   │
                          │ item_id (FK)        │───┘
                          │ count               │     NULLABLE
                          │ found_in_raid       │
                          │ created_at          │
                          │ updated_at          │
                          └─────────────────────┘
```

---

## テーブル定義

### 1. traders（トレーダー）

ゲーム内のトレーダー（NPC）情報を管理します。

#### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | VARCHAR(50) | NOT NULL | - | 主キー（tarkov.dev API の ID） |
| name | VARCHAR(100) | NOT NULL | - | トレーダー名 |
| image_url | VARCHAR(500) | NULL | NULL | トレーダー画像URL |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード更新日時 |

#### 制約

| 制約名 | 種類 | カラム | 説明 |
|--------|------|--------|------|
| traders_pkey | PRIMARY KEY | id | 主キー |

#### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|---------------|--------|------|------|
| traders_pkey | id | UNIQUE | 主キーインデックス |
| ix_traders_name | name | BTREE | 名前検索用 |

#### サンプルデータ

| id | name | image_url |
|----|------|-----------|
| 5a7c2eca46aef81a7ca2145d | Prapor | https://assets.tarkov.dev/... |
| 5ac3b934156ae10c4430e83c | Therapist | https://assets.tarkov.dev/... |
| 58330581ace78e27b8b10cee | Skier | https://assets.tarkov.dev/... |
| 5935c25fb3acc3127c3d8cd9 | Peacekeeper | https://assets.tarkov.dev/... |
| 54cb57776803fa99248b456e | Mechanic | https://assets.tarkov.dev/... |
| 5a7c2ebb46aef81a7ca2145f | Ragman | https://assets.tarkov.dev/... |
| 5c0647fdd443bc2504c2d371 | Jaeger | https://assets.tarkov.dev/... |
| 579dc571d53a0658a154fbec | Fence | https://assets.tarkov.dev/... |
| 5ac3b86a86f77461491d1ad8 | Lightkeeper | https://assets.tarkov.dev/... |
| 638f541a29ffd1183d187f57 | BTR Driver | https://assets.tarkov.dev/... |
| 656f0f98d80a6c7b51afc346 | Ref | https://assets.tarkov.dev/... |

---

### 2. tasks（タスク）

ゲーム内のタスク（クエスト）情報を管理します。

#### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | VARCHAR(50) | NOT NULL | - | 主キー（tarkov.dev API の ID） |
| trader_id | VARCHAR(50) | NOT NULL | - | 外部キー（traders.id） |
| name | VARCHAR(200) | NOT NULL | - | タスク名 |
| min_player_level | INTEGER | NOT NULL | 1 | 受注可能プレイヤーレベル |
| wiki_link | VARCHAR(500) | NULL | NULL | Wiki ページへのリンク |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード更新日時 |

#### 制約

| 制約名 | 種類 | カラム | 説明 |
|--------|------|--------|------|
| tasks_pkey | PRIMARY KEY | id | 主キー |
| tasks_trader_id_fkey | FOREIGN KEY | trader_id | traders.id への参照 |

#### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|---------------|--------|------|------|
| tasks_pkey | id | UNIQUE | 主キーインデックス |
| ix_tasks_trader_id | trader_id | BTREE | トレーダー検索用 |
| ix_tasks_name | name | BTREE | タスク名検索用 |
| ix_tasks_min_player_level | min_player_level | BTREE | レベルフィルタ用 |

#### サンプルデータ

| id | trader_id | name | min_player_level |
|----|-----------|------|------------------|
| 5c51aac186f77432ea65c552 | 5a7c2eca46aef81a7ca2145d | Debut | 1 |
| 5c51aac186f77432ea65c554 | 5ac3b934156ae10c4430e83c | Shortage | 1 |
| 5967530a86f77462ba22226b | 58330581ace78e27b8b10cee | What's on the flash drive? | 8 |

---

### 3. items（アイテム）

タスク目標で使用されるアイテム情報を管理します。

#### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | VARCHAR(50) | NOT NULL | - | 主キー（tarkov.dev API の ID） |
| name | VARCHAR(200) | NOT NULL | - | アイテム名 |
| image_url | VARCHAR(500) | NULL | NULL | アイテム画像URL |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード更新日時 |

#### 制約

| 制約名 | 種類 | カラム | 説明 |
|--------|------|--------|------|
| items_pkey | PRIMARY KEY | id | 主キー |

#### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|---------------|--------|------|------|
| items_pkey | id | UNIQUE | 主キーインデックス |
| ix_items_name | name | BTREE | アイテム名検索用 |

#### サンプルデータ

| id | name | image_url |
|----|------|-----------|
| 544fb45d4bdc2dee738b4568 | Salewa first aid kit | https://assets.tarkov.dev/... |
| 590c621186f774138d11ea29 | Secure Flash drive | https://assets.tarkov.dev/... |
| 5448be9a4bdc2dfd2f8b456a | RGD-5 hand grenade | https://assets.tarkov.dev/... |

---

### 4. task_objectives（タスク目標）

タスクの具体的な達成条件を管理します。

#### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | VARCHAR(50) | NOT NULL | - | 主キー（tarkov.dev API の ID） |
| task_id | VARCHAR(50) | NOT NULL | - | 外部キー（tasks.id） |
| type | VARCHAR(50) | NOT NULL | - | 目標タイプ |
| description | TEXT | NULL | NULL | 目標の説明文 |
| item_id | VARCHAR(50) | NULL | NULL | 外部キー（items.id）- アイテム系目標の場合 |
| count | INTEGER | NOT NULL | 1 | 必要数 |
| found_in_raid | BOOLEAN | NOT NULL | FALSE | Found in Raid 必須か |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | CURRENT_TIMESTAMP | レコード更新日時 |

#### 制約

| 制約名 | 種類 | カラム | 説明 |
|--------|------|--------|------|
| task_objectives_pkey | PRIMARY KEY | id | 主キー |
| task_objectives_task_id_fkey | FOREIGN KEY | task_id | tasks.id への参照 |
| task_objectives_item_id_fkey | FOREIGN KEY | item_id | items.id への参照 |

#### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|---------------|--------|------|------|
| task_objectives_pkey | id | UNIQUE | 主キーインデックス |
| ix_task_objectives_task_id | task_id | BTREE | タスク検索用 |
| ix_task_objectives_item_id | item_id | BTREE | アイテム検索用 |
| ix_task_objectives_type | type | BTREE | タイプ別検索用 |

#### 目標タイプ（type）一覧

| タイプ値 | 説明 | item_id使用 |
|---------|------|-------------|
| kill | 敵の殺害 | No |
| giveItem | アイテムの納品 | Yes |
| findItem | アイテムの発見（所持確認） | Yes |
| plantItem | アイテムの設置 | Yes |
| mark | 場所のマーキング | No |
| visit | 場所への訪問 | No |
| extract | 特定条件での脱出 | No |
| shoot | 射撃（特定条件） | No |
| skill | スキルレベル達成 | No |
| traderLevel | トレーダーレベル達成 | No |
| experience | 経験値獲得 | No |
| buildWeapon | 武器の組み立て | Yes |
| taskStatus | 別タスクの完了 | No |
| other | その他 | No |

#### サンプルデータ

| id | task_id | type | description | item_id | count | found_in_raid |
|----|---------|------|-------------|---------|-------|---------------|
| obj_001 | 5c51aac186f77432ea65c552 | kill | Eliminate 5 Scavs | NULL | 5 | FALSE |
| obj_002 | 5c51aac186f77432ea65c554 | giveItem | Hand over 4 Salewa | 544fb45d4bdc2dee738b4568 | 4 | TRUE |
| obj_003 | 5967530a86f77462ba22226b | giveItem | Hand over 2 Flash drives | 590c621186f774138d11ea29 | 2 | TRUE |

---

## SQLAlchemy モデル定義

### models/trader.py

```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Trader(Base):
    __tablename__ = "traders"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tasks = relationship("Task", back_populates="trader")
```

### models/task.py

```python
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True)
    trader_id = Column(
        String(50), ForeignKey("traders.id"), nullable=False, index=True
    )
    name = Column(String(200), nullable=False, index=True)
    min_player_level = Column(Integer, nullable=False, default=1, index=True)
    wiki_link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    trader = relationship("Trader", back_populates="tasks")
    objectives = relationship("TaskObjective", back_populates="task")
```

### models/item.py

```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    task_objectives = relationship("TaskObjective", back_populates="item")
```

### models/task_objective.py

```python
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class TaskObjective(Base):
    __tablename__ = "task_objectives"

    id = Column(String(50), primary_key=True)
    task_id = Column(
        String(50), ForeignKey("tasks.id"), nullable=False, index=True
    )
    type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    item_id = Column(
        String(50), ForeignKey("items.id"), nullable=True, index=True
    )
    count = Column(Integer, nullable=False, default=1)
    found_in_raid = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    task = relationship("Task", back_populates="objectives")
    item = relationship("Item", back_populates="task_objectives")
```

---

## マイグレーションファイル

### 初期マイグレーション

```python
"""Initial migration

Revision ID: 001
Create Date: 2024-01-15 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # traders テーブル
    op.create_table(
        'traders',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index('ix_traders_name', 'traders', ['name'])

    # items テーブル
    op.create_table(
        'items',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index('ix_items_name', 'items', ['name'])

    # tasks テーブル
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('trader_id', sa.String(50),
                  sa.ForeignKey('traders.id'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('min_player_level', sa.Integer, nullable=False, default=1),
        sa.Column('wiki_link', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index('ix_tasks_trader_id', 'tasks', ['trader_id'])
    op.create_index('ix_tasks_name', 'tasks', ['name'])
    op.create_index('ix_tasks_min_player_level', 'tasks', ['min_player_level'])

    # task_objectives テーブル
    op.create_table(
        'task_objectives',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('task_id', sa.String(50),
                  sa.ForeignKey('tasks.id'), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('item_id', sa.String(50),
                  sa.ForeignKey('items.id'), nullable=True),
        sa.Column('count', sa.Integer, nullable=False, default=1),
        sa.Column('found_in_raid', sa.Boolean, nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index('ix_task_objectives_task_id', 'task_objectives', ['task_id'])
    op.create_index('ix_task_objectives_item_id', 'task_objectives', ['item_id'])
    op.create_index('ix_task_objectives_type', 'task_objectives', ['type'])


def downgrade() -> None:
    op.drop_table('task_objectives')
    op.drop_table('tasks')
    op.drop_table('items')
    op.drop_table('traders')
```

---

## フロントエンド localStorage スキーマ

### キー: `tarkov-progress`

ユーザーの進捗データをブラウザのローカルストレージに保存します。

#### スキーマ定義

```typescript
interface ProgressData {
  /** クリア済みタスクIDの配列 */
  completedTaskIds: string[];
  /** 最終更新日時（ISO 8601形式） */
  updatedAt: string;
}
```

#### サンプルデータ

```json
{
  "completedTaskIds": [
    "5c51aac186f77432ea65c552",
    "5c51aac186f77432ea65c554",
    "5967530a86f77462ba22226b"
  ],
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

#### TypeScript 型定義

```typescript
// types/progress.ts

export interface ProgressData {
  completedTaskIds: string[];
  updatedAt: string;
}

// デフォルト値
export const DEFAULT_PROGRESS: ProgressData = {
  completedTaskIds: [],
  updatedAt: new Date().toISOString(),
};
```

#### ストレージ操作ユーティリティ

```typescript
// lib/storage.ts

const STORAGE_KEY = 'tarkov-progress';

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_PROGRESS;
  }

  try {
    return JSON.parse(stored) as ProgressData;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    updatedAt: new Date().toISOString(),
  }));
}

export function clearProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
```

---

## データ整合性ルール

### 1. 外部キー制約

| 子テーブル | 親テーブル | ON DELETE | ON UPDATE |
|-----------|-----------|-----------|-----------|
| tasks.trader_id | traders.id | RESTRICT | CASCADE |
| task_objectives.task_id | tasks.id | CASCADE | CASCADE |
| task_objectives.item_id | items.id | SET NULL | CASCADE |

### 2. ビジネスルール

- `min_player_level` は 1 以上の値
- `count` は 1 以上の値
- `type` が `giveItem`, `findItem`, `plantItem`, `buildWeapon` の場合、`item_id` は NOT NULL
- `found_in_raid` は `item_id` が設定されている場合のみ意味を持つ

### 3. 一意性制約

- 各テーブルの `id` は tarkov.dev API からの ID をそのまま使用
- 同じ ID のレコードが存在する場合は UPDATE（UPSERT）

---

## データ同期仕様

### Tarkov.dev API との同期

同期処理では以下の順序でデータを取得・保存します：

1. **traders** - トレーダー情報を取得・保存
2. **items** - タスク目標で使用されるアイテムを取得・保存
3. **tasks** - タスク情報を取得・保存
4. **task_objectives** - タスク目標を取得・保存

### 同期クエリ

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
