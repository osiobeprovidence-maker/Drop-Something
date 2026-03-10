const fs = require('fs');
const playwright = require('playwright');

(async () => {
  const out = { console: [], errors: [], requests: [], dialogs: [], popups: [] };
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    out.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    out.errors.push(String(err));
  });
  page.on('requestfailed', (req) => {
    out.requests.push({ url: req.url(), failure: req.failure() && req.failure().errorText });
  });
  page.on('dialog', async (dialog) => {
    out.dialogs.push({ type: dialog.type(), message: dialog.message() });
    try { await dialog.dismiss(); } catch (e) {}
  });

  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' , timeout: 30000});
    await page.waitForTimeout(1000);

    // Click the Sign In button
    try {
      await Promise.all([
        page.waitForEvent('popup', { timeout: 5000 }).then(p => { out.popups.push({ url: p.url() }); p.close().catch(()=>{}); }).catch(()=>{}),
        page.click('button:has-text("Sign In")', { timeout: 5000 }).catch(()=>{})
      ]);
    } catch (e) {
      out.errors.push('Sign-in click error: ' + String(e));
    }

    await page.screenshot({ path: 'screenshots/preview_signin.png', fullPage: true }).catch(()=>{});
    await page.waitForTimeout(2000);
  } catch (e) {
    out.errors.push('Navigation error: ' + String(e));
  }

  await browser.close();
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync('logs/console_signin.json', JSON.stringify(out, null, 2));
  console.log('Wrote logs/console_signin.json and screenshots/preview_signin.png (if created)');
})();
