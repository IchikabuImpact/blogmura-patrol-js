# Docker 運用手順（ファイル構成を崩さずに追加）

ここに置くのは **3ファイルのみ**：
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

これらは既存の Node/TypeScript 構成を一切壊さず、同じルートに「追加」するだけで動きます。

## 前提
- プロジェクト直下に `package.json`, `tsconfig.json`, `src/` などがあること
- `.env` と `urls.txt` をプロジェクト直下に配置（ホスト側のファイルをそのまま使います）
- Docker / Docker Desktop がインストール済み

> コンテナ内では基本 **HEADLESS=true** のまま運用してください（GUI不要・安定）。

---

## 開発（ホットリロード）
ホストのソースをマウントし、`npm run dev`（tsx watch）で即時反映。
```bash
docker compose up --build app-dev
# 停止は Ctrl+C（バックグラウンドにしたい場合は -d）
```
- コンテナ内の `node_modules` と衝突しないよう、匿名ボリューム `/app/node_modules` を割り当てています。
- 変更はホストの `src/` に保存すれば即反映されます。

## 本番相当（ビルド済みを実行）
マルチステージビルドで TypeScript を `dist/` にビルドし、実行層はランタイム依存のみ。
```bash
docker compose up --build app
# 1回巡回したらコンテナは終了します（再実行は同コマンド）
```

## 環境変数・設定
- `.env` をプロジェクト直下に置いて、`env_file: .env` で読み込みます（Dockerfileに含めません）
- 主要変数：`EMAIL`, `PASSWORD`, `LOGIN_URL`, `URLS_FILE`, `HEADLESS`, `WAIT_MS`
- 巡回先は `urls.txt`（1行1URL）

## Windows / WSL2 の注意
- Docker Desktop（Linux コンテナ）であれば、この構成でそのまま動きます。
- **WSL2 ディストリ内のパス**（例：`/home/you/work/...`）のほうが I/O が速いです。Windowsパス直下を大量マウントすると遅く感じることがあります。
- GUI（ヘッドフル）で見たい場合は X11 転送など追加設定が必要です。その場合は `HEADLESS=false` とし、`DISPLAY` を適切に設定してください（通常は推奨しません）。

## Selenium + ChromeDriver を Docker で使う場合（任意）
本 Dockerfile は **Playwright 前提**です。Selenium を使いたい場合は、Chrome/ChromeDriver を含む別イメージを作る必要があります（`selenium/standalone-chrome` など）。

例：`docker-compose.selenium.yml` を作り、`selenium/standalone-chrome` と Node コンテナを別サービスで立て、`SELENIUM_REMOTE_URL` を使う、などのパターンが考えられます。必要なら雛形を用意します。

## よくある質問
- **.env をイメージに入れないのはなぜ？**  
  秘密情報をビルド成果物に焼き込まないためです。`env_file` でホスト側の `.env` を読み込みます。
- **HEADLESS=false にしたい**  
  コンテナでGUI表示するには X11/VNC 等が必要です。通常は HEADLESS=true を推奨します。
- **Playwright のブラウザ依存は？**  
  ベースイメージがブラウザと依存を内包しているため、追加インストールは不要です。
