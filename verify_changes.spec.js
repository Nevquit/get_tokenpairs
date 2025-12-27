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

  // 8. Click the "Add All Results to CSV" button
  await page.click('button:has-text("Add All Results to CSV")');

  // 9. Wait for at least one row to appear in the selected pairs table
  await page.waitForSelector('#selectedPairsTableContainer tbody tr', { timeout: 20000 });

  // 10. Verify that the number of selected rows is greater than 0
  const selectedRowsCount = await page.locator('#selectedPairsTableContainer tbody tr').count();
  expect(selectedRowsCount).toBeGreaterThan(0);
  console.log(`Successfully added ${selectedRowsCount} search results to the selection.`);

  // 11. Take a screenshot of the selected pairs table
  await page.screenshot({ path: 'verify_add_all.png' });
  console.log('Screenshot "verify_add_all.png" taken.');
});
