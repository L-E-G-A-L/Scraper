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
const targetText = "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)";
(() => __awaiter(void 0, void 0, void 0, function* () {
    var userAgent = require('user-agents');
    const browser = yield puppeteer_1.default.launch({
        headless: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    });
    const page = yield browser.newPage();
    yield page.setUserAgent(userAgent.random().toString());
    yield page.goto('https://amazon.com/', { waitUntil: 'load' });
    // await page.setViewport({width: 1080, height: 1024});
    yield page.locator('input[type="text"]').fill(targetText);
    page.keyboard.press('Enter');
    yield page.waitForNavigation();
    const listing = yield page.evaluate((targetText) => {
        const listingURLS = document.querySelectorAll('a');
        return Array.from(listingURLS).map((item => {
            const h2 = item.querySelector('h2');
            if ((h2 === null || h2 === void 0 ? void 0 : h2.getAttribute('aria-label')) === targetText) {
                return item.href;
            }
        })).filter(Boolean);
    }, targetText);
    yield page.goto('' + listing[0], { waitUntil: 'load' });
    // To-Implement: Scrape the image and price
}))();
// 
// import puppeteer from 'puppeteer';
// (async () => {
//     // Launch the browser and open a new blank page
//     const browser = await puppeteer.launch({
//         headless: false,
//         executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
//     })
//     const page = await browser.newPage();
//     // Navigate the page to a URL
//     await page.goto('https://developer.chrome.com/');
//     // Set screen size
//     await page.setViewport({width: 1080, height: 1024});
//     // Type into search box
//     await page.type('.devsite-search-field', 'automate beyond recorder');
//     // Wait and click on first result
//     const searchResultSelector = '.devsite-result-item-link';
//     await page.waitForSelector(searchResultSelector);
//     await page.click(searchResultSelector);
// // Locate the full title with a unique string
// const textSelector = await page.waitForSelector(
//   'text/Customize and automate',
// );
// const fullTitle = await textSelector?.evaluate(el => el.textContent);
// // Print the full title
// console.log('The title of this blog post is "%s".', fullTitle);
// await browser.close();
//   })();
