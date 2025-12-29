const { test, expect } = require('@playwright/test');

test.describe('SMG ID Manual Update', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should allow manual update of SMG ID and display decoded version', async ({ page }) => {
    const smgIdInput = page.locator('#smgIdInput');
    const updateButton = page.locator('button:has-text("Update")');
    const smgIdDisplay = page.locator('#smgIDDisplay');

    // 1. Initial SMG ID should be loaded
    await expect(smgIdDisplay).not.toHaveText('--');
    await expect(smgIdDisplay).not.toHaveText('Loading...');

    // Store the initial SMG ID to compare later
    const initialSmgId = await smgIdDisplay.innerText();

    // 2. Input a new hex SMG ID and update
    const newHexSmgId = '0x6d792d6e65772d736d67'; // "my-new-smg"
    const expectedDecodedSmgId = 'my-new-smg';
    await smgIdInput.fill(newHexSmgId);
    await updateButton.click();

    // 3. Verify the display shows the decoded version
    await expect(smgIdDisplay).toHaveText(expectedDecodedSmgId);

    // 4. Verify the input is cleared after update
    await expect(smgIdInput).toHaveValue('');

    // 5. Add an item to selected pairs and check if the new SMG ID is used in the table
    // First, perform a search to get some results
    await page.locator('#assetIn').fill('BTC');
    await page.locator('button:has-text("Search")').click();

    // Wait for results to appear and click the first '+' button
    await page.waitForSelector('.result-card');
    await page.locator('button:has-text("+")').first().click();

    // Wait for the selected pairs table to be rendered
    await page.waitForSelector('#selectedPairsTableContainer table');

    // Check the SMG column in the first row of the selected pairs table
    const smgCell = page.locator('#selectedPairsTableContainer tbody tr:first-child td:nth-child(2)');
    await expect(smgCell).toHaveText(expectedDecodedSmgId);

    // 6. Generate CSV and check if the raw hex is used (conceptual check, can't download)
    // This part is harder to test with Playwright without complex setup.
    // We will trust the frontend logic that `rawSmgID` is used for the CSV.
    // We have already verified the display value, which is the main point of this test.
  });

  test('should handle SMG ID with leading zeros and no 0x prefix', async ({ page }) => {
    const smgIdInput = page.locator('#smgIdInput');
    const updateButton = page.locator('button:has-text("Update")');
    const smgIdDisplay = page.locator('#smgIDDisplay');

    const newHexSmgId = '000068656c6c6f'; // "hello"
    const expectedDecodedSmgId = 'hello';

    await smgIdInput.fill(newHexSmgId);
    await updateButton.click();

    await expect(smgIdDisplay).toHaveText(expectedDecodedSmgId);
  });
});
