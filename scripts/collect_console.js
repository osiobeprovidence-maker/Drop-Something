const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const out = { console: [], errors: [], requests: [] };
  const browser = await chromium.launch();
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

  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' , timeout: 30000});
    await page.screenshot({ path: 'screenshots/preview.png', fullPage: true }).catch(()=>{});
    // wait a bit to catch async console logs
    await page.waitForTimeout(2000);
  } catch (e) {
    out.errors.push('Navigation error: ' + String(e));
  }

  await browser.close();
  fs.mkdirSync('logs', { recursive: true });
  fs.writeFileSync('logs/console.json', JSON.stringify(out, null, 2));
  console.log('Wrote logs/console.json and screenshots/preview.png (if created)');
})();
