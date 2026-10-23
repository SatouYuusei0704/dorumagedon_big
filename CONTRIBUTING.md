# 開発ルール

4人で並行開発するためのルールです。迷ったらここを見てください。

## ブランチ運用（GitHub Flow）

- `main` … 常に動く状態を保つ。**直接 push 禁止**、必ず PR 経由でマージ
- 作業ブランチは `main` から切る

| 種類               | ブランチ名の例               |
| ------------------ | ---------------------------- |
| 機能追加           | `feature/avatar-editor`      |
| バグ修正           | `fix/geolocation-permission` |
| ドキュメント・設定 | `chore/update-readme`        |

## 作業の流れ

```bash
git switch main
git pull                              # 最新を取得
git switch -c feature/xxx             # ブランチ作成
# ... 実装 ...
git add .
git commit -m "feat: アバター編集画面を追加"
git push -u origin feature/xxx        # GitHub で PR を作成
```

1. Issue を立てて自分をアサインする
2. ブランチを切って実装する
3. PR を作成し、**1人以上のレビュー承認**をもらってからマージ
4. CI（lint / 型チェック / build）が通っていることを確認

## コミットメッセージ

`種類: 内容` の形式で日本語OK。

- `feat:` 機能追加 / `fix:` バグ修正 / `style:` 見た目のみ / `refactor:` リファクタ / `docs:` ドキュメント / `chore:` 設定など

## 担当とディレクトリ

衝突を減らすため、機能ごとに `src/features/` 配下のフォルダを分けています。

| 担当 | 機能                   | 主な作業場所                                 |
| ---- | ---------------------- | -------------------------------------------- |
| A    | アバター・ドット絵UI   | `src/features/avatar/`, `src/components/ui/` |
| B    | 位置情報・すれ違い判定 | `src/features/encounter/`, `src/lib/geo/`    |
| C    | アイテム交換・図鑑     | `src/features/items/`, `src/app/api/`        |
| D    | リアルタイム通知・演出 | `src/features/notification/`                 |

共通ファイル（`src/lib/`, `src/types/`, `supabase/migrations/`, `package.json`）を変更するときは、PR にその旨を書いてチームに共有してください。

## DB スキーマの変更

- `supabase/migrations/` に連番で新しい SQL ファイルを追加する（既存ファイルは書き換えない）
- 例: `0002_add_item_icon.sql`
- 変更したら `src/types/database.ts` も更新する

## コード規約

- 保存時に Prettier で自動整形（VS Code 推奨拡張機能を入れてください）
- コミット前に `npm run lint` と `npm run typecheck`
- `.env.local` は**絶対にコミットしない**
