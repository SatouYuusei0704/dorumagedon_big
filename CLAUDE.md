すれ違いWebアプリ 開発環境・技術仕様書

1. プロジェクト概要
   ニンテンドー3DSの「すれ違い広場」のような世界観をレトロなドット絵で再現するWebブラウザアプリです。
   ユーザーのデバイスの位置情報（Geolocation API）を活用し、近くにいる別のユーザーと仮想的にすれ違ってアイテム（果物など）を交換したり、Mii風アバターを集めたりする体験を提供します。
2. 採用技術スタック（Tech Stack）
   分類技術・サービス用途 / 選定理由フロントエンドNext.js (App Router)
   :iphone: すれ違いWebアプリ 必用技術リスト
   • 言語・フレームワーク
   TypeScript: 型安全なJavaScript開発
   Next.js (App Router): フロントエンドUI構築およびバックエンドAPI（Route Handlers）の実装
   • デザイン・UI表現
   Tailwind CSS (または CSS Modules): ドット絵デザインやレトロゲーム風UIのスタイリング
   HTML5 Canvas API (または Pixi.js): キャラクターのドット絵描画・アニメーション処理
   Webフォント: レトロ感を演出するドット絵風フォント（「Pixel Mplus」や「美咲フォント」等）
   • 位置情報・距離計算
   Geolocation API: ブラウザ経由でスマホ等の端末から現在地（緯度・経度）を取得
   Turf.js: 2点間の距離計算や半径〇〇m以内のすれ違い判定
   • データベース・バックエンド
   Supabase (PostgreSQL / PostGIS): ユーザー情報、位置情報、すれ違い履歴、所持アイテム（果物）データの保存
   Supabase Realtime (または WebSocket): すれ違い成功時のリアルタイム通知・演出処理
   NextAuth.js (または Supabase Auth): ユーザー識別・ログイン認証（匿名ログイン等）
   • 開発・運用インフラ
   GitHub: ソースコードのバージョン管理およびチーム内のコードレビュー
   Vercel: Webアプリのデプロイ・ホスティング（Geolocation APIに必要なHTTPS環境の自動提供）
3. 必要な開発環境構築（Setup）
   開発を始める前に、各メンバーのPCへ以下のツールのインストールとアカウント準備をお願いします。
   3.1 事前準備（事前インストール・アカウント作成）
4. Node.js (v18.x LTS 以上推奨)
   インストール確認: node -v / npm -v
5. Git
   GitHubアカウントの準備 & SSHキーの設定（またはGitHub Desktop）
6. エディタ: VS Code（推奨）
   • 推奨拡張機能:
   ESLint (コードチェック)
   Prettier - Code formatter (コード整形)
   Tailwind CSS IntelliSense (補完機能)
7. サービスアカウント作成:
   GitHub: チームリポジトリへの招待を受ける
   Supabase: プロジェクト管理者が招待メールを送信
   Vercel: GitHub連携で即時プレビュー環境を利用
   3.2 ローカル開発手順（リポジトリの初期化〜起動）
   ① リポジトリのクローンとパッケージ共有
   Bash

git clone <GitHubのリポジトリURL>
cd <プロジェクトフォルダー名>
npm install② 環境変数（.env.local）の設定
プロジェクト直下に
.env.local ファイルを作成し、Supabaseの接続キーを設定します。
コード スニペット

NEXT_PUBLIC_SUPABASE_URL=
https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key③ 開発サーバーの起動
Bash

npm run devブラウザで
http://localhost:3000 にアクセスして動作確認を行います。
:warning: 位置情報（Geolocation API）の注意点
スマホ実機でテストする場合、HTTP通信ではGeolocation APIがブロックされるため、VercelのプレビューURL（HTTPS）を使うか、ローカルのSSL証明書設定が必要になります。4. 主な機能と開発役割（ロードマップ案）

1. アバター・ドット絵UI構築
   Canvas APIまたはimage-rendering: pixelated;を使ったレトロUIの共通コンポーネント化
2. 位置情報取得 & すれ違い判定機能
   Geolocation APIでの位置取得と、Supabase / Turf.js による「半径Xメートル以内のユーザー検索」
3. アイテム交換 & 図鑑データベース
   すれ違った相手から果物（リンゴ・ブドウなど）を受け取り、データ更新するAPI実装
4. リアルタイム通知
   Supabase Realtimeを使った「すれ違い成功！」のエフェクト演出
