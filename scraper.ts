import puppeteer from 'puppeteer';

const targetText: string = "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)";

(async () => {
  var userAgent = require('user-agents');
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.random().toString())

  await page.goto('https://amazon.com/', { waitUntil: 'load' });

  // await page.setViewport({width: 1080, height: 1024});
  
  await page.locator('input[type="text"]').fill(targetText);
  page.keyboard.press('Enter');
  await page.waitForNavigation();
  
  const listing = await page.evaluate((targetText) => {
    const listingURLS = document.querySelectorAll('a');
    return Array.from(listingURLS).map((item => {
      const h2 = item.querySelector('h2');
      if (h2?.getAttribute('aria-label') === targetText) {
        return item.href;
      }
    })
  ).filter(Boolean)
}, targetText)
await page.goto(''+listing[0], { waitUntil: 'load' });

const listingImage = await page.$eval('img#main-image', el => el.getAttribute('src'), { timeout: 5000 });
const listingPrice = await page.$eval('span.apexPriceToPay > span', el => el.innerHTML, { timeout: 5000 });

browser.close();
})();