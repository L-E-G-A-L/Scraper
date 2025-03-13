import puppeteer from "puppeteer";
import fs from "fs";

/* <-------------------- Full product names as listed on amazon that need to be scraped -------------------->*/
const targets: string[] = [
  "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)",
  "2024 MacBook Pro Laptop with M4 Pro, 14‑core CPU, 20‑core GPU: Built for Apple Intelligence, 16.2-inch Liquid Retina XDR Display, 24GB Unified Memory, 512GB SSD Storage; Space Black",
  "Apple iPad Pro 2024 (13-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)",
  "Apple iPad Pro 2024 (11-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)",
];

/* <-------------------- Code for creating json file and saving scraped data -------------------->*/
const filePath = "data.json";

const initializeFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    console.log("Created data.json file with an empty object");
  }
};

const writeToFile = (allScrapedData: any) => {
  const existingData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(existingData);

  allScrapedData.forEach(
    (scrapedProductData: {
      product: string;
      image: string;
      price: string;
      time: string;
    }) => {
      const { product, image, price, time } = scrapedProductData!;
      if (!parsedData[product]) {
        parsedData[product] = [];
      }
      parsedData[product].push({ image, price, time });
    }
  );
  fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
  console.log("Data appended to", filePath);
};

/* <-------------------- Logic for scraping individual product -------------------->*/
const scrapeProduct = async (targetText: string) => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto("https://amazon.com/", { waitUntil: "load" });

    await page.setViewport({ width: 1920, height: 1080 });

    await page.locator('input[type="text"]').fill(targetText);
    page.keyboard.press("Enter");
    await page.waitForNavigation();

    let productFound: boolean = false;
    let listing: any;
    while (!productFound) {
      listing = await page.evaluate((targetText) => {
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

      if (listing.length > 0) {
        productFound = true;
        listing = listing[0];
        break;
      }

      const nextButton = await page.$("a.s-pagination-next");
      if (!nextButton) {
        console.log(`No more pages. Product not found: ${targetText}`);
        break;
      }

      await nextButton.click();
      await page.waitForNavigation({ waitUntil: "load" });
    }

    if (!productFound) {
      return null;
    }

    await page.goto("" + listing, { waitUntil: "load" });

    let listingImage: string | null = "",
      listingPrice: string = "";

    try {
      listingImage = await page.$eval(
        "img#main-image",
        (el) => el.getAttribute("src"),
        { timeout: 5000 }
      );
    } catch (error) {
      try {
        listingImage = await page.$eval(
          "img#landingImage",
          (el) => el.getAttribute("src"),
          { timeout: 5000 }
        );
      } catch (error) {
        console.error("Error extracting the image for ", targetText);
      }
    }

    try {
      listingPrice = await page.$eval(
        "span.a-price > span",
        (el) => el.innerHTML,
        { timeout: 5000 }
      );
    } catch (error) {
      console.error("Error extracting the price for", targetText);
    }

    return {
      product: targetText,
      image: listingImage,
      price: listingPrice,
      time: new Date().toJSON(),
    };
  } catch (error) {
    console.log("Failed to scrape the data of ", targetText)
  } finally {
    browser.close();
  }
};

/* <-------------------- Logic for concurrency -------------------->*/
const scrapeAllProducts = async (targets: string[]) => {
  const scrapedResults = await Promise.all(targets.map(scrapeProduct));
  writeToFile(scrapedResults);
};

/* <-------------------- Starts the scraping :) -------------------->*/
initializeFile();
scrapeAllProducts(targets);
