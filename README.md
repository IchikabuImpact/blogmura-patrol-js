# BlogMura Patrol (Node.js / TypeScript)

Java + Selenium 版をベースに、**Playwright** を使ったモダンな Node.js/TypeScript プロジェクトに移植した雛形です。
- Node.js v20+（お手元は v22.18.0 でOK）
- Playwright（Chrome/Chromium を自動管理。WSL/Ubuntuで動作）
- .env でメール/パスワード、巡回URLなどを設定
- TypeScript + ESLint + Prettier

## 使い方

### 1) 依存関係のインストール
```bash
cd blogmura-node
corepack enable # 省略可
npm i
npm run playwright:install
```

### 2) 設定
`.env.example` を `.env` にコピーして編集します。
```bash
cp .env.example .env
# EMAIL, PASSWORD を必ず設定
# 必要に応じて HEADLESS, WAIT_MS を調整
# 巡回先URLは urls.txt を編集
```

### 3) 実行（開発）
```bash
npm run dev
```

### 4) ビルド & 実行（本番相当）
```bash
npm run build
npm start
```

## 既存 Java 版との主な対応
- `email.txt`, `password.txt`, `url.txt` → `.env` と `urls.txt`
- Selenium + ChromeDriver → Playwright（Chromium）。ChromeDriverを使いたい場合は README 末尾参照。

## 注意
- ブログ村の DOM/セレクタが変更されることがあります。 `.env` の `SELECTOR_...` で上書き可能です。
- 利用規約違反やアクセス過多にならないよう配慮してください。`WAIT_MS` を十分に取りましょう。

---

## 代替: Selenium WebDriver (Node.js) を使う場合
ChromeDriver を既にお持ちの場合は、`src/selenium.ts` のサンプルを参考にしてください。必要パッケージ：
```bash
npm i selenium-webdriver chromedriver
```
