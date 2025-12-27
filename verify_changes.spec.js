const { test, expect } = require('@playwright/test');

test('Verify raw JSON in fee view and raw network fee in selection table', async ({ page }) => {
  // 1. Navigate to the application
  await page.goto('http://localhost:8000');

  // Wait for the data to be loaded
  await expect(page.locator('#statusText')).toContainText('已加载', { timeout: 15000 });

  // 2. Fill in search criteria for a reliable pair
  await page.fill('#assetIn', 'USDC');
  await page.fill('#chainA', 'Ethereum');
  await page.fill('#chainB', 'Polygon');
  await page.click('h1'); // Click header to dismiss suggestions
  await page.click('button:has-text("Search")');

  // 3. Wait for results and click "View Fees" on the first card
  await page.waitForSelector('#resultsList .result-card', { timeout: 20000 });
  const firstCard = page.locator('#resultsList .result-card').first();
  await firstCard.locator('button:has-text("View Fees")').click();

  // 4. Check if the fee details box is visible and expand the JSON view
  const feeBox = firstCard.locator('[id^=fee-box-]');
  await expect(feeBox).toBeVisible();

  const jsonDetails = feeBox.locator('details:has-text("View Raw Fee JSON")');
  await expect(jsonDetails).toBeVisible();
  await jsonDetails.locator('summary').click();

  // 5. Verify the JSON content is present (updated to be more flexible)
  const jsonPre = jsonDetails.locator('pre[id^=fee-json-]');
  await expect(jsonPre).not.toBeEmpty();
  await expect(jsonPre).not.toHaveText('{}');
  await expect(jsonPre).not.toHaveText('Loading...');
  console.log('Raw Fee JSON is visible.');


  // 6. Take a screenshot of the fee view
  await page.screenshot({ path: 'verify_json.png' });
  console.log('Screenshot "verify_json.png" taken.');

  // 7. Click the "+" button to add the pair to the selection
  await firstCard.locator('button:has-text("+")').click();

  // 8. Wait for the selected pairs table to appear and verify the fee
  await page.waitForSelector('#selectedPairsTableContainer table');
  const selectedRow = page.locator('#selectedPairsTableContainer tbody tr').first();

  // Find the index of the "network fee" header
  const headers = await page.locator('#selectedPairsTableContainer th').allInnerTexts();
  const feeColumnIndex = headers.findIndex(header => header.toLowerCase() === 'network fee');
  expect(feeColumnIndex).toBeGreaterThan(-1);

  const feeCell = selectedRow.locator(`td`).nth(feeColumnIndex);
  await expect(feeCell).not.toHaveText('Loading...');
  await expect(feeCell).not.toHaveText('Error');

  const feeValue = await feeCell.innerText();
  // Check if the value is a large integer (raw fee) and doesn't contain a decimal point
  // This is a simple check; a more robust one might be `expect(Number.isInteger(Number(feeValue))).toBe(true);`
  expect(feeValue).not.toContain('.');
  expect(parseInt(feeValue)).toBeGreaterThan(1000); // Raw fees are usually large numbers
  console.log(`Raw network fee "${feeValue}" is displayed in the selection table.`);

  // 9. Take a screenshot of the selected pairs table
  await page.screenshot({ path: 'verify_raw_fee.png' });
  console.log('Screenshot "verify_raw_fee.png" taken.');
});
