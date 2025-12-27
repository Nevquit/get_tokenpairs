const { test, expect } = require('@playwright/test');

test('Verify fee text wrapping', async ({ page }) => {
  // 1. Navigate to the application
  await page.goto('http://localhost:8000');

  // Wait for the data to be loaded
  await expect(page.locator('#statusText')).toContainText('已加载', { timeout: 15000 });

  // 2. Fill in search criteria from the screenshot
  await page.fill('#assetIn', 'USDT');
  await page.fill('#chainA', 'Wanchain');
  await page.fill('#chainB', 'Ethereum');
  await page.click('h1'); // Dismiss suggestions
  await page.click('button:has-text("Search")');

  // 3. Wait for results and click "View Fees" on the first card
  await page.waitForSelector('#resultsList .result-card', { timeout: 20000 });
  const firstCard = page.locator('#resultsList .result-card').first();
  await firstCard.locator('button:has-text("View Fees")').click();

  // 4. Check if the fee details box is visible
  const feeBox = firstCard.locator('[id^=fee-box-]');
  await expect(feeBox).toBeVisible();

  // 5. Take a screenshot of the fee details section
  await feeBox.screenshot({ path: 'verify_fee_wrap.png' });
  console.log('Screenshot "verify_fee_wrap.png" taken.');
});
