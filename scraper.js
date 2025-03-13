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
const filePath = "data.json";
const initializeFile = () => {
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, JSON.stringify({}, null, 2));
        console.log("Created data.json file with an empty object");
    }
};
initializeFile();
const targetText = "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)";
(() => __awaiter(void 0, void 0, void 0, function* () {
    var userAgent = require("user-agents");
    const browser = yield puppeteer_1.default.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    });
    const page = yield browser.newPage();
    yield page.setUserAgent(userAgent.random().toString());
    yield page.goto("https://amazon.com/", { waitUntil: "load" });
    // await page.setViewport({width: 1080, height: 1024});
    yield page.locator('input[type="text"]').fill(targetText);
    page.keyboard.press("Enter");
    yield page.waitForNavigation();
    const listing = yield page.evaluate((targetText) => {
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
    yield page.goto("" + listing[0], { waitUntil: "load" });
    let listingImage;
    let listingPrice;
    try {
        listingImage = yield page.$eval("img#main-image", (el) => el.getAttribute("src"), { timeout: 5000 });
    }
    catch (error) {
        console.error("Error extracting the image:", error);
    }
    try {
        listingPrice = yield page.$eval("span.apexPriceToPay > span", (el) => el.innerHTML, { timeout: 5000 });
    }
    catch (error) {
        console.error("Error extracting the price:", error);
    }
    let data = {
        image: listingImage,
        price: listingPrice,
    };
    let extractedTime = new Date().toJSON();
    const existingData = fs_1.default.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(existingData);
    parsedData[extractedTime] = data;
    fs_1.default.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
    console.log("Data appended to", filePath);
    browser.close();
}))();
