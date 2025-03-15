"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const bottleneck_1 = __importDefault(require("bottleneck"));
/* <-------------------- Full product names as listed on amazon that need to be scraped -------------------->*/
const limiter = new bottleneck_1.default({
    maxConcurrent: 2,
});
/* <-------------------- Full product names as listed on amazon that need to be scraped -------------------->*/
const targets = [
    "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)",
    "Apple iPad Pro 2024 (13-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)",
    "Apple iPad Pro 2024 (11-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)",
];
/* <-------------------- Code for creating json file and saving scraped data -------------------->*/
const filePath = "data.json";
const initializeFile = () => {
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, JSON.stringify({}, null, 2));
        console.log("Created data.json file with an empty object");
    }
};
const writeToFile = (allScrapedData) => {
    const existingData = fs_1.default.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(existingData);
    allScrapedData.forEach((scrapedProductData) => {
        const { product, image, price, time } = scrapedProductData;
        if (!parsedData[product] && product !== "") {
            parsedData[product] = [];
        }
        if (product !== "")
            parsedData[product].push({ image, price, time });
    });
    fs_1.default.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
    console.log("Data appended to", filePath);
};
/* <-------------------- Logic for scraping individual product -------------------->*/
const scrapeProduct = (targetText) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    });
    try {
        const page = yield browser.newPage();
        yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        yield page.goto("https://amazon.com/", { waitUntil: "load" });
        yield page.setViewport({ width: 1920, height: 1080 });
        yield page.locator('input[type="text"]').fill(targetText);
        page.keyboard.press("Enter");
        yield page.waitForNavigation();
        let productFound = false;
        let listing;
        let pagesScraped = 0;
        while (!productFound && pagesScraped < 10) {
            listing = yield page.evaluate((targetText) => {
                const listingURLS = document.querySelectorAll("a");
                return Array.from(listingURLS)
                    .map((item) => {
                    const h2 = item.querySelector("h2");
                    if ((h2 === null || h2 === void 0 ? void 0 : h2.getAttribute("aria-label")) === targetText) {
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
            const nextButton = yield page.locator("a.s-pagination-next");
            if (!nextButton) {
                console.log(`No more pages. Product not found: ${targetText}`);
                break;
            }
            pagesScraped += 1;
            yield nextButton.click();
        }
        if (!productFound) {
            return {
                product: targetText,
                image: "",
                price: "",
                time: new Date().toJSON(),
            };
        }
        yield page.goto("" + listing, { waitUntil: "load" });
        let listingImage = "", listingPrice = "";
        try {
            listingImage = yield page.$eval("img#main-image", (el) => el.getAttribute("src"), { timeout: 5000 });
        }
        catch (error) {
            try {
                listingImage = yield page.$eval("img#landingImage", (el) => el.getAttribute("src"), { timeout: 5000 });
            }
            catch (error) {
                console.error("Error extracting the image for ", targetText);
            }
        }
        try {
            listingPrice = yield page.$eval("span.a-price > span", (el) => el.innerHTML, { timeout: 5000 });
        }
        catch (error) {
            console.error("Error extracting the price for", targetText);
        }
        console.log(targetText);
        return {
            product: targetText,
            image: listingImage,
            price: listingPrice,
            time: new Date().toJSON(),
        };
    }
    catch (error) {
        console.log("Failed to scrape the data of ", targetText);
        return {
            product: "",
            image: "",
            price: "",
            time: "",
        };
    }
    finally {
        browser.close();
    }
});
const scrapeWithLimiter = limiter.wrap(scrapeProduct);
/* <-------------------- Logic for concurrency -------------------->*/
const scrapeAllProducts = (targets) => __awaiter(void 0, void 0, void 0, function* () {
    const scrapedResults = yield Promise.all(targets.map(scrapeWithLimiter));
    writeToFile(scrapedResults);
});
/* <-------------------- Starts the scraping :) -------------------->*/
initializeFile();
scrapeAllProducts(targets);
