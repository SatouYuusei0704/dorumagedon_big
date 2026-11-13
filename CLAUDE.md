# すれ違いWebアプリ 開発環境・技術仕様書

## 1. プロジェクト概要

ニンテンドー3DSの「すれ違い広場」のような世界観を、レトロなドット絵で再現するWebブラウザアプリです。

- 端末の位置情報（Geolocation API）を使い、近くにいた別のユーザーと仮想的にすれ違う
- すれ違うと、**相手の出身地（都道府県）のご当地アイテム**をもらえる（お互いに 1 つずつ）
- すれ違った人は広場に集まり、その人のデータを **NPC の敵** として好きなときにバトルできる
- アイテムは図鑑（コレクション）に記録され、そうびするとバトルの「ご当地わざ」になる

## 2. 主な仕様

### すれ違い

- ゲーム画面を開いている間、30 秒ごとに現在地を送信する（アプリを閉じている間は送れない）
- 自分の今の位置から **200m 以内に、3 時間以内にいた人** とすれ違う（時間差でも成立する）
- 同じ相手とは 3 時間に 1 回まで
- 成立すると「すれちがい成功！」を表示する（相手側で成立した分は Supabase Realtime で受け取る）
- 判定は DB の `check_encounters()`（PostGIS）で行う

### ご当地アイテム

- `items` テーブルで管理する。出身地にアイテムがない県の人からは「旅人のつるぎ」をもらう
- キャラクター作成時に、自分の出身地のアイテムを 1 つもらってそうびする（`claim_starter_item()`）
- アイテムにはタイプ（`items.category`）があり、そうびするとバトルで効果が出る

| タイプ   | 表示     | 効果                     |
| -------- | -------- | ------------------------ |
| `sword`  | つるぎ   | ご当地わざのダメージ +6  |
| `shield` | たて     | ガードの回数 +1          |
| `helmet` | かぶと   | さいだいHP +15           |
| `charm`  | おまもり | エネルギー 25 でスタート |
| `basic`  | きほん   | 効果なし                 |

### すれちがいNPCバトル

- リアルタイム対戦ではなく、すれ違った相手のデータを読み込んだ NPC と戦うターン制バトル
- コマンドは 3 つ
  - こうげき: 小ダメージ。エネルギーがたまる
  - ご当地わざ: エネルギー 50 を使う大ダメージ
  - ガード: 1 バトル 2 回まで。相手のご当地わざを 1 ダメージに抑え、通常こうげきは半減
- 勝つと相手の出身地のアイテムを 1 つもらえる（同じ相手からは 1 日 1 回まで）。戦績は `battles` に記録
- 勝っても負けてもコインをもらえる（勝ち 30 / 負け 10。もらえるのは 1 日 10 回まで）
- ルールと数値は `src/features/battle/engine.ts`（`BATTLE_RULES` / `ITEM_TRAITS` / `BATTLE_ITEMS`）にまとめてある。
  変更したら `src/features/battle/engine.test.ts` も合わせて直し、`npm test` を通すこと

### コインとショップ

- バトルでもらったコインを使い、ショップ（`/shop`）で「どうぐ」を買う
- どうぐはバトル画面の「アイテム」ボタンから使う（1 バトル 2 個まで。使ったターンは攻撃できない）
- 商品と値段は DB の `shop_items`、バトル中の効果は `engine.ts` の `BATTLE_ITEMS`（id をそろえること）

| どうぐ           | 値段 | 効果                              |
| ---------------- | ---- | --------------------------------- |
| かいふくドリンク | 30   | HP を 30 回復                     |
| パワーだんご     | 40   | そのバトル中、あたえるダメージ +3 |
| タフネスもち     | 40   | そのバトル中、さいだいHP +15      |

- コインと持ち物の増減は DB の関数（`record_battle` / `buy_shop_item` / `use_shop_item`）だけが行う

## 3. 画面と API

| 画面             | 内容                                                 |
| ---------------- | ---------------------------------------------------- |
| `/start`         | タイトル画面                                         |
| `/login`         | ログイン・新規登録                                   |
| `/new_character` | キャラクター作成（はじめのご当地アイテムを受け取る） |
| `/park`          | すれちがい広場（すれ違った人をタップしてバトル）     |
| `/battle`        | すれちがいNPCバトル                                  |
| `/collection`    | ご当地アイテムの図鑑                                 |
| `/shop`          | コインでどうぐを買うショップ                         |
| `/status`        | キャラクターの見た目・そうび・戦績・ログアウト       |

`/park` `/battle` `/collection` `/shop` `/status` はログインが必要（`src/middleware.ts` で未ログインなら `/login` へ）。

| API                       | 内容                                       |
| ------------------------- | ------------------------------------------ |
| `GET/PATCH /api/profile`  | プロフィールの取得・更新（そうびの変更も） |
| `POST /api/location`      | 現在地の送信とすれ違い判定                 |
| `GET /api/encounters`     | すれ違い履歴                               |
| `GET /api/items`          | 図鑑（全アイテムと所持数）                 |
| `POST /api/items/starter` | はじめのご当地アイテムを受け取る           |
| `GET /api/battles/setup`  | バトルの準備（自分と敵のデータ）           |
| `GET/POST /api/battles`   | 戦績の取得・勝敗の記録                     |
| `GET/POST /api/shop`      | ショップの商品とコインの取得・どうぐを買う |
| `POST /api/shop/use`      | バトル中にどうぐを 1 つ使う                |

## 4. 技術スタック

- **言語・フレームワーク**: TypeScript / Next.js (App Router。API は Route Handlers)
- **UI**: Tailwind CSS、ドット絵風フォント（DotGothic16）。アバターは `src/features/avatar` の `AvatarSprite`
- **位置情報**: Geolocation API。距離の判定は Supabase の PostGIS
- **DB・バックエンド**: Supabase (PostgreSQL / PostGIS / Auth / Realtime)
  - 所持アイテム・すれ違い・戦績・そうびの書き込みは、すべて DB の関数（security definer の RPC）経由。クライアントから直接は書き換えられない
- **インフラ**: GitHub（CI: lint / typecheck / test / format:check / build）、Vercel

## 5. フォルダ構成

```
src/app/            画面と API
src/components/ui/  複数の機能で使う UI
src/features/       機能ごとのコード（avatar / auth / encounter / notification / battle / items）
src/lib/            共通処理（Supabase クライアントなど）
src/types/          DB と API の型
supabase/migrations/ DB の変更（連番の SQL）
```

## 6. 開発のしかた

```bash
npm install
npm run dev      # http://localhost:3000
```

`.env.local` に Supabase の接続キーを設定します。

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

PR を出す前に、CI と同じチェックを通してください。

```bash
npm run lint && npm run typecheck && npm test && npm run format:check && npm run build
```

### DB を変更するとき

- `supabase/migrations/` に連番で新しい SQL ファイルを追加する（既存ファイルは書き換えない）
- 追加した SQL は Supabase の SQL Editor で実行する（自動では適用されない）
- `src/types/database.ts` も合わせて更新する

### 位置情報の注意点

- スマホ実機では HTTP だと Geolocation API がブロックされる。Vercel のプレビュー URL（HTTPS）を使う
- PC でのテストは、ブラウザの DevTools → Sensors で位置を指定する（別アカウントの 2 つのブラウザで同じ座標にするとすれ違う）
