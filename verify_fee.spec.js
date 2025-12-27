
const { test, expect } = require('@playwright/test');

test('should correctly calculate and display the network fee', async ({ page }) => {
  // Mock the tokenPairs API
  await page.route('**/api/tokenPairs', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            "id": 1,
            "tokenPairID": "1",
            "fromChain": { "chainID": "1", "chainName": "Wanchain", "chainType": "WAN" },
            "toChain": { "chainID": "2", "chainName": "Ethereum", "chainType": "ETH" },
            "fromToken": { "address": "0x123", "decimals": 18 },
            "toToken": { "address": "0x456", "decimals": 18 },
            "symbol": "wanBTC",
            "fromAccount": { "symbol": "wanBTC" }
          }
        ]
      })
    });
  });

  // Mock the smgID API
  await page.route('**/api/smgID', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: "0xSmgID" })
    });
  });

  // Mock the fee API with a specific value
  await page.route('**/api/quotaAndFee?fromChainType=WAN&toChainType=ETH&tokenPairID=1&symbol=wanBTC', async route => {
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            "success": true,
            "data": {
                "networkFee": {
                    "value": "75000000000000000000" // This is 75 with 18 decimals
                }
            }
        })
    });
  });

  // --- Test Steps ---
  // 1. Navigate to the app
  await page.goto('http://localhost:3000');

  // 2. Wait for initial data to be loaded
  await expect(page.locator('#statusText')).toContainText('已加载 1 条路径');

  // 3. Perform a search to render the result card
  await page.fill('#assetIn', 'wanBTC');
  await page.click('button:has-text("Search")');
  await expect(page.locator('.result-card')).toBeVisible();

  // 4. Click the '+' button to select the pair
  await page.click('button:has-text("+")');

  // 5. Verify the fee in the selected pairs table
  // Find the table row. Since there's only one, we can use a simple selector.
  const selectedPairRow = page.locator('#selectedPairsTableContainer tbody tr').first();

  // Find the index of the 'network_fee' column
  const headers = await page.locator('#selectedPairsTableContainer thead th').allTextContents();
  const feeColumnIndex = headers.findIndex(h => h.toLowerCase() === 'network fee');
  expect(feeColumnIndex).toBeGreaterThan(-1); // Ensure the header was found

  // Assert that the text in the correct cell is '75'
  const feeCell = selectedPairRow.locator(`td:nth-child(${feeColumnIndex + 1})`);
  await expect(feeCell).toHaveText('75');
});
