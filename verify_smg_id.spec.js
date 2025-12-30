const { test, expect } = require('@playwright/test');

test('Verify SMG ID update functionality', async ({ page }) => {
  // 1. Navigate to the application
  await page.goto('http://localhost:8000');

  // Wait for the data to be loaded
  await expect(page.locator('#statusText')).toContainText('已加载', { timeout: 15000 });

  // 2. Define a new SMG ID
  const newSmgId = 'TestSMGID';

  // 3. Fill in the input and click the update button
  await page.fill('#smgIdInput', newSmgId);
  await page.click('button:has-text("Update")');

  // 4. Verify that the SMG ID display has been updated
  await expect(page.locator('#smgIDDisplay')).toHaveText(newSmgId);
  console.log(`Successfully updated SMG ID to "${newSmgId}".`);

  // 5. Take a screenshot to visually confirm the change
  await page.screenshot({ path: 'verify_smg_id_update.png' });
  console.log('Screenshot "verify_smg_id_update.png" taken.');
});
