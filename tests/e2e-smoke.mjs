import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.locator('#app-title').waitFor();
  await page.getByRole('button', { name: /深色模式|亮色模式/ }).click();

  await page.getByRole('textbox', { name: '内容' }).fill('https://example.com');
  await page.getByRole('button', { name: '生成二维码' }).click();
  await page.locator('[data-generator-result] canvas').waitFor();

  await page.getByRole('tab', { name: 'WiFi 配置' }).click();
  await page.getByLabel('WiFi 名称（SSID）').fill('MyHome');
  await page.getByLabel('密码').fill('12345678');
  await page.getByRole('button', { name: '生成 WiFi 二维码' }).click();
  await page.locator('[data-wifi-result] canvas').waitFor();

  await page.getByRole('tab', { name: '解析二维码' }).click();
  await page.getByText('点击选择图片').waitFor();
} finally {
  await browser.close();
}
