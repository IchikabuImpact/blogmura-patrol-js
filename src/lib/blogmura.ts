import type { Page } from 'playwright';
import type { AppConfig } from './config.js';

export async function loginBlogMura(page: Page, cfg: AppConfig): Promise<void> {
  // 1) トップ→ログインページへ遷移（直接URLでもOK）
  await page.goto(cfg.LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // 2) ログインフォーム探索
  //   - そのままフォームがある場合と、ログインリンクを辿る場合の両対応
  const hasEmail = await page.$(cfg.SELECTOR_EMAIL);
  if (!hasEmail) {
    // ログインリンクを探してクリック（テキストが異なる場合あり）
    const candidates = ['text=ログイン', 'text=サインイン', 'role=link[name=/ログイン|Sign in/i]'];
    for (const sel of candidates) {
      const link = await page.$(sel);
      if (link) {
        await link.click();
        break;
      }
    }
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
  }

  // 3) 入力
  const emailInput = await page.waitForSelector(cfg.SELECTOR_EMAIL, { timeout: 30_000 });
  const pwInput = await page.waitForSelector(cfg.SELECTOR_PASSWORD, { timeout: 30_000 });
  await emailInput.fill(cfg.EMAIL);
  await pwInput.fill(cfg.PASSWORD);

  // 4) 送信
  const loginBtn = await page.$(cfg.SELECTOR_LOGIN);
  if (loginBtn) {
    await loginBtn.click();
  } else {
    // フォーム submit フォールバック
    await pwInput.press('Enter');
  }

  // 5) ログイン完了待ち（URL変化やユーザー名の表示など、適宜強化可能）
  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 });
  // 軽い待機（2FA やリダイレクトがある場合の余裕）
  await page.waitForTimeout(1500);
}
