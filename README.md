# すれ違い広場（sumapuro_3DS）

ニンテンドー3DSの「すれ違い広場」の世界観をレトロなドット絵で再現する Web アプリです。
位置情報を使って近くのユーザーと仮想的にすれ違い、果物アイテムの交換やアバター集めができます。

詳しい仕様は [CLAUDE.md](CLAUDE.md)、開発ルールは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 技術スタック

Next.js (App Router) / TypeScript / Tailwind CSS / Supabase (PostgreSQL + PostGIS, Realtime, Auth) / Turf.js / Vercel

## セットアップ

必要: Node.js 18.18 以上、Git

```bash
git clone <リポジトリURL>
cd sumapuro_3DS
npm install
cp .env.example .env.local   # Supabase の URL と anon key を記入
npm run dev
```

http://localhost:3000 を開いて表示されれば OK。

### DB の初期化（管理者のみ・初回）

Supabase の SQL Editor で [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) を実行します。

## コマンド

| コマンド            | 内容             |
| ------------------- | ---------------- |
| `npm run dev`       | 開発サーバー起動 |
| `npm run build`     | 本番ビルド       |
| `npm run lint`      | ESLint           |
| `npm run typecheck` | 型チェック       |
| `npm run format`    | Prettier で整形  |

## ディレクトリ構成

```
src/
├─ app/                 # ページ・API (Route Handlers)
├─ components/ui/       # 共通UI（ドット絵風ボタン・ウィンドウ）
├─ features/            # 機能ごとのコード（担当者別）
│  ├─ avatar/
│  ├─ encounter/
│  ├─ items/
│  └─ notification/
├─ lib/
│  ├─ supabase/         # Supabase クライアント (client / server)
│  └─ geo/              # 距離計算・すれ違い判定 (Turf.js)
└─ types/               # 型定義
supabase/migrations/    # DB スキーマ
```

## スマホ実機での位置情報テスト

Geolocation API は HTTPS が必須です。Vercel のプレビュー URL（PR ごとに自動生成）で確認してください。
