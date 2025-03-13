import puppeteer from "puppeteer";
import fs from "fs";

const filePath = "data.json";
const initializeFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    console.log("Created data.json file with an empty object");
  }
};
initializeFile();

const targetText: string =
  "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)";

(async () => {
  var userAgent = require("user-agents");

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.random().toString());
  await page.goto("https://amazon.com/", { waitUntil: "load" });

  // await page.setViewport({width: 1080, height: 1024});

  await page.locator('input[type="text"]').fill(targetText);
  page.keyboard.press("Enter");
  await page.waitForNavigation();

  const listing = await page.evaluate((targetText) => {
    const listingURLS = document.querySelectorAll("a");
    return Array.from(listingURLS)
      .map((item) => {
        const h2 = item.querySelector("h2");
        if (h2?.getAttribute("aria-label") === targetText) {
          return item.href;
        }
      })
      .filter(Boolean);
  }, targetText);
  
  await page.goto("" + listing[0], { waitUntil: "load" });

  let listingImage;
  let listingPrice;
  
  try {
    listingImage = await page.$eval(
      "img#main-image",
      (el) => el.getAttribute("src"),
      { timeout: 5000 }
    );
  } catch (error) {
    console.error("Error extracting the image:", error);
  }
  
  try {
    listingPrice = await page.$eval(
      "span.apexPriceToPay > span",
      (el) => el.innerHTML,
      { timeout: 5000 }
    );
  } catch (error) {
    console.error("Error extracting the price:", error);
  }

  let data = {
    image: listingImage,
    price: listingPrice,
  };

  let extractedTime = new Date().toJSON();

  const existingData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(existingData);
  parsedData[extractedTime] = data;
  fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
  console.log("Data appended to", filePath);

  browser.close();
})();
