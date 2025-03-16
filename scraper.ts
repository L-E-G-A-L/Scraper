import puppeteer from "puppeteer";
import fs from "fs";
import Bottleneck from "bottleneck";
import { targets } from "./targets";

/* <-------------------- Full product names as listed on amazon that need to be scraped -------------------->*/
const limiter = new Bottleneck({
  maxConcurrent: 2,
});

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
      if (!parsedData[product] && product !== "") {
        parsedData[product] = [];
      }
      if(product !== "") parsedData[product].push({ image, price, time });
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
    let pagesScraped = 0
    while (!productFound && pagesScraped < 10) {
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

      const nextButton = await page.locator("a.s-pagination-next");
      if (!nextButton) {
        console.log(`No more pages. Product not found: ${targetText}`);
        break;
      }
      pagesScraped+= 1;
      await nextButton.click();
    }

    if (!productFound) {
      return {
        product: targetText,
        image: "",
        price: "",
        time: new Date().toJSON(),
      };
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
    console.log("Failed to scrape the data of ", targetText);
    return {
      product: "",
      image: "",
      price: "",
      time: "",
    };
  } finally {
    browser.close();
  }
};

const scrapeWithLimiter = limiter.wrap(scrapeProduct);

/* <-------------------- Logic for concurrency -------------------->*/
export const scrapeAllProducts = async (targets: string[]) => {
  initializeFile();
  const scrapedResults = await Promise.all(targets.map(scrapeWithLimiter));
  writeToFile(scrapedResults);
};
