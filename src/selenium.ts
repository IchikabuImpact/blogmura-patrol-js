// 代替実装：ChromeDriver + Selenium WebDriver（Node.js）
// 使う場合：
//   npm i selenium-webdriver chromedriver
//   node -r dotenv/config src/selenium.ts
import 'dotenv/config';
import { Builder, By } from 'selenium-webdriver';
import * as fs from 'fs/promises';

async function main() {
  const email = process.env.EMAIL ?? '';
  const password = process.env.PASSWORD ?? '';
  const urlsFile = process.env.URLS_FILE ?? 'urls.txt';
  const waitMs = Number(process.env.WAIT_MS ?? '5000');

  const driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get(process.env.LOGIN_URL ?? 'https://blogmura.com/');

    // 必要に応じてログインページへ誘導（例：ログインリンクのクリック）
    // await driver.findElement(By.linkText('ログイン')).click();

    await driver.findElement(By.css(process.env.SELECTOR_EMAIL ?? 'input[name="email"]')).sendKeys(email);
    await driver.findElement(By.css(process.env.SELECTOR_PASSWORD ?? 'input[name="password"]')).sendKeys(password);
    const loginBtnSel = process.env.SELECTOR_LOGIN ?? '.re-button-submit-small';
    const btn = await driver.findElements(By.css(loginBtnSel));
    if (btn.length > 0) await btn[0].click();

    const raw = await fs.readFile(urlsFile, 'utf-8');
    const urls = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));

    for (const url of urls) {
      console.log('visit:', url);
      await driver.get(url);
      await driver.sleep(waitMs);
    }
  } finally {
    await driver.quit();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
