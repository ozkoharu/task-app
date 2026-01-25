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
