# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Escape from Tarkov のタスク進捗管理サイト。プレイヤーが全体の何％タスクを完了しているかを可視化するツール。

**メイン機能:**
- タスク一覧からクリア済みタスクをチェック
- 全体進捗率・トレーダー別進捗率をダッシュボードで表示
- 進捗はローカルストレージに保存（認証不要）

## 技術スタック

- **フロントエンド**: Next.js, TypeScript
- **バックエンド**: Python, FastAPI
- **データベース**: PostgreSQL
- **インフラ**: Docker, Docker Compose

## 開発環境

ローカル開発および本番環境ともにDockerを使用。

```bash
# 開発環境の起動
docker compose up

# 開発環境の起動（バックグラウンド）
docker compose up -d

# コンテナの再ビルド
docker compose up --build

# 停止
docker compose down
```

## データベース

```bash
# マイグレーション実行
docker compose exec backend alembic upgrade head

# マイグレーション作成
docker compose exec backend alembic revision --autogenerate -m "説明"

# データベース接続
docker compose exec db psql -U postgres -d tarkov
```

## リンター/フォーマッター

```bash
# フロントエンド（ESLint）
docker compose exec frontend npm run lint

# ESLint 自動修正
docker compose exec frontend npm run lint -- --fix
```

## テスト

テスト駆動開発（TDD）を採用。受け入れテストカバレッジ目標は90%。

```bash
# フロントエンドテスト
docker compose exec frontend npm test

# バックエンドテスト
docker compose exec backend pytest

# カバレッジ付きテスト（バックエンド）
docker compose exec backend pytest --cov=app --cov-report=term-missing
```

## アーキテクチャ

```
/
├── frontend/          # Next.js フロントエンド
│   ├── src/
│   │   ├── app/       # App Router
│   │   ├── components/
│   │   └── lib/
│   └── tests/
├── backend/           # FastAPI バックエンド
│   ├── app/
│   │   ├── api/       # APIエンドポイント
│   │   ├── models/    # データモデル
│   │   └── services/  # ビジネスロジック
│   └── tests/
├── docker-compose.yml
└── docs/
```

## 開発方針

- 新機能の実装前に必ずテストを書く（TDD）
- 受け入れテストのカバレッジ90%を維持
- フロントエンド・バックエンド間のAPI仕様を明確に定義

## Git運用ルール

### ブランチ戦略

```
main          # 本番環境（常にデプロイ可能な状態）
├── develop   # 開発統合ブランチ
├── feature/* # 機能開発ブランチ
├── fix/*     # バグ修正ブランチ
└── hotfix/*  # 緊急修正ブランチ
```

- `main`: 本番環境用。直接pushは禁止
- `develop`: 開発の統合ブランチ。feature/fixブランチはここにマージ
- `feature/*`: 新機能開発用（例: `feature/task-list`）
- `fix/*`: バグ修正用（例: `fix/progress-calculation`）
- `hotfix/*`: 本番の緊急修正用

### ブランチ命名規則

```bash
# 機能開発
feature/[機能名]
例: feature/trader-filter, feature/item-list

# バグ修正
fix/[修正内容]
例: fix/progress-display, fix/api-error-handling

# 緊急修正
hotfix/[修正内容]
例: hotfix/critical-bug
```

### コミットメッセージ規約

```
<type>: <subject>

<body>（任意）
```

**type一覧:**
| type | 説明 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメントのみの変更 |
| style | コードの意味に影響しない変更（空白、フォーマット等） |
| refactor | リファクタリング（機能追加・バグ修正ではない） |
| test | テストの追加・修正 |
| chore | ビルドプロセス、ツール設定の変更 |

**例:**
```bash
feat: タスク一覧にフィルター機能を追加
fix: 進捗率の計算が正しくない問題を修正
docs: API仕様書を更新
refactor: タスクコンポーネントを分割
test: トレーダーAPIのテストを追加
```

### プルリクエストルール

1. **作成前チェック:**
   - テストが全てパスしていること
   - リンターエラーがないこと
   - developブランチと競合がないこと

2. **PRタイトル:** コミットメッセージと同じ形式
   ```
   feat: タスク一覧にフィルター機能を追加
   ```

3. **PR説明に含める内容:**
   - 変更の概要
   - 関連するIssue番号（あれば）
   - テスト方法
   - スクリーンショット（UI変更の場合）

4. **マージ:**
   - Squash and Merge を使用
   - マージ後はブランチを削除

### 開発フロー

```
1. developから新しいブランチを作成
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature

2. 開発・コミット
   git add .
   git commit -m "feat: 新機能を追加"

3. pushしてPR作成
   git push origin feature/new-feature
   → GitHub上でPR作成

4. レビュー・修正後マージ
   → developにマージ
   → ブランチ削除

5. リリース時
   → developからmainにマージ
```
