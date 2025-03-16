# Web Scraper for Amazon Product Data  
![Static Badge](https://img.shields.io/badge/Version-2.2.0-blue)

---

### Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [How to Use](#how-to-use)
- [Code Structure](#code-structure)
- [Example Output](#example-output)
- [Error Handling](#error-handling)
- [Customization](#customization)
- [Limitations](#limitations)
- [License](#license)
- [Author](#author)
- [Changelog](#changelog)

---

### Overview  
This is a TypeScript-based web scraper built using **Puppeteer** to extract product details (image URL and price) from Amazon. The scraper searches for a specific product, navigates to its page, extracts the required data, and saves it to a JSON file (`data.json`). The data is stored with **product names as keys** and an array of objects containing `image`, `price`, and `time` for each scrape, allowing for historical tracking of product details. The application is scheduled to run **once every hour** using **node-cron**.

---

### Features  
- **Search for a Specific Product**: The scraper searches for predefined products on Amazon.  
- **Extract Product Details**: Extracts the product image URL and price.  
- **Save Data to JSON**: Stores the extracted data in a JSON file with a timestamp.  
- **Error Handling**: Handles errors during data extraction and logs it.  
- **Pagination Handling**: Automatically navigates to the next page if the product is not found on the current page.  
- **Concurrency**: Scrapes multiple products simultaneously using `Promise.all`.  
- **Dynamic ID Handling**: Handles cases where element IDs (e.g., `main-image`, `landingImage`) vary.  
- **Scheduling**: Automatically runs the scraper once every hour using `node-cron`.

---

### Prerequisites  
Before running the script, ensure you have the following installed:  
- **Node.js** (v16 or higher)  
- **Puppeteer** (`npm install puppeteer`)  
- **user-agents** (`npm install user-agents`)  
- **node-cron** (`npm install node-cron`)  

---

### How to Use  
1. **Install the dependencies**:  
   ```bash
   npm install
   ```
2. **Running the script**:
   ```bash
   node scheduler.js
   ```
3. **Check the Output**:
    - The extracted data will be saved in `data.json` file in the root directory.
    - Each product will have its own `key`, and the data will include `image, price, and time`.

---

### Code Structure

1. Initialize data.json:
    - Checks if data.json exists. If not, creates it with an empty object.

2. Scrape Amazon:
    - Launches a browser instance and navigates to Amazon.
    - Searches for the target product (targetText).
    - Extracts the product URL from the search results.
    - Handles pagination to navigate to the next page if the product is not found.
    - Navigates to the product page and extracts the image URL and price.

3. Save Data:
    - Appends the extracted data to data.json with a timestamp.
    - Data is grouped by product name, and each entry includes image, price, and time.
4. Scheduling:
    - Uses node-cron to schedule the scraper to run once every hour.

---

### Example Output

```sh
{
  "Apple iPhone 15 Pro Max, 256GB, Black Titanium - Unlocked (Renewed Premium)": [
    {
      "image": "https://m.media-amazon.com/images/I/31hXtQ2a2GL._AC_.jpg",
      "price": "$872.92",
      "time": "2025-03-13T21:49:29.184Z"
    },
    {
      "image": "https://m.media-amazon.com/images/I/31hXtQ2a2GL._AC_.jpg",
      "price": "$875.23",
      "time": "2025-03-13T22:09:43.570Z"
    }
  ],
  "2024 MacBook Pro Laptop with M4 Pro, 14‑core CPU, 20‑core GPU: Built for Apple Intelligence, 16.2-inch Liquid Retina XDR Display, 24GB Unified Memory, 512GB SSD Storage; Space Black": [
    {
      "image": "https://m.media-amazon.com/images/I/61hw7aZWYSL._AC_SX522_.jpg",
      "price": "$2,229.00",
      "time": "2025-03-13T21:49:30.655Z"
    },
    {
      "image": "https://m.media-amazon.com/images/I/61hw7aZWYSL.__AC_SY445_SX342_QL70_FMwebp_.jpg",
      "price": "$2,229.00",
      "time": "2025-03-13T22:09:43.900Z"
    }
  ],
  "Apple iPad Pro 2024 (13-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)": [
    {
      "image": "https://m.media-amazon.com/images/I/51B5O6c32tL._AC_SX679_.jpg",
      "price": "$1,060.00",
      "time": "2025-03-13T21:49:28.875Z"
    },
    {
      "image": "https://m.media-amazon.com/images/I/51B5O6c32tL._AC_SX679_.jpg",
      "price": "$1,060.00",
      "time": "2025-03-13T22:09:42.485Z"
    }
  ],
  "Apple iPad Pro 2024 (11-inch, Wi-Fi + Cellular, 256GB) - Space Black (Renewed)": [
    {
      "image": "https://m.media-amazon.com/images/I/51B5O6c32tL._AC_SX679_.jpg",
      "price": "$949.49",
      "time": "2025-03-13T21:49:25.417Z"
    },
    {
      "image": "https://m.media-amazon.com/images/I/51B5O6c32tL._AC_SX679_.jpg",
      "price": "$949.49",
      "time": "2025-03-13T22:09:39.653Z"
    }
  ]
}
```

---

### Error Handling

- If the image or price cannot be extracted, an error message is logged to the console.
- The script continues execution even if one of the fields fails to extract.
- If a product is not found, the script logs the error and moves to the next product.

---

### Customization

- Change Target Product: 
Modify the targetText variable to search for a different product.
```bash
const targets: string[] = [
  "Your Product Name 1",
  "Your Product Name 2"
];
```
- Change Output File:
Update the filePath variable to save data to a different file.
```bash
const filePath = "your-file-name.json";
```

---

### Limitations

- **Dynamic Content:** The script assumes the product page structure remains consistent. If Amazon changes its layout, the selectors may need to be updated.
- **Pagination:** The script handles pagination but may take longer to scrape all content if the product is on a later page.

---

### License
This project is open-source and available under the MIT License.

---

### Author

 Aravind Kotagiri

---

### Changelog

### 2.2.0
  - Added scheduling using node-cron to run the scraper once every hour.
  - Updated file structure for better readability.
### 2.1.0
  - Added rate limiter.
  - Fixed bugs.
### 2.0.0**
  - Added support for pagination and dynamic ID handling.
  - Added concurrency for faster scraping.
  - Updated data structure to group results by product name and include timestamps.
### 1.2.0
  - Updated scraping logic.
  - Added readme file.
### 1.0.0
- Initial release with basic functionality for scraping product details and saving to JSON.
