# Web Scraper for Amazon Product Data  
**Version: 1.0.0**

---

## Overview  
This is a TypeScript-based web scraper built using **Puppeteer** to extract product details (image URL and price) from Amazon. The scraper searches for a specific product, navigates to its page, extracts the required data, and saves it to a JSON file (`data.json`). The data is stored with a timestamp as the key, allowing for historical tracking of product details.

---

## Features  
- **Search for a Specific Product**: The scraper searches for a predefined product on Amazon.  
- **Extract Product Details**: Extracts the product image URL and price.  
- **Save Data to JSON**: Stores the extracted data in a JSON file with a timestamp.  
- **Error Handling**: Gracefully handles errors during data extraction.  
- **Dynamic User-Agent**: Uses a random user-agent for each request to avoid detection.  

---

## Prerequisites  
Before running the script, ensure you have the following installed:  
- **Node.js** (v16 or higher)  
- **Puppeteer** (`npm install puppeteer`)  
- **user-agents** (`npm install user-agents`)  

---

## How to Use  
1. **Install the dependencies**:  
   ```bash
   npm install
   ```
2. **Running the script**:
   ```bash
   node scraper.js
   ```
3. **Check the Output**:
    - The extracted data will be saved in data.json in the root directory.
    - Each entry will have a timestamp as the key and the product details (image URL and price) as the value.

---

### Code Structure

1. Initialize data.json:
    - Checks if data.json exists. If not, creates it with an empty object.

2. Scrape Amazon:
    - Launches a browser instance and navigates to Amazon.
    - Searches for the target product (targetText).
    - Extracts the product URL from the search results.
    -   Navigates to the product page and extracts the image URL and price.

3. Save Data:
    - Appends the extracted data to data.json with a timestamp.

---

### Example Output (data.json)

```sh
{
  "2023-10-05T12:34:56.789Z": {
    "image": "https://example.com/image.jpg",
    "price": "$999.99"
  }
}
```

---

### Error Handling

- If the image or price cannot be extracted, an error message is logged to the console.
- The script continues execution even if one of the fields fails to extract.

---

### Customization

- Change Target Product: 
Modify the targetText variable to search for a different product.
```bash
const targetText: string = "Your Product Name Here";
```
- Change Output File:
Update the filePath variable to save data to a different file.
```bash
const filePath = "your-file-name.json";
```

---

### Limitations

- Amazon Restrictions: Amazon may block requests if too many are made in a short period. Use proxies or rate-limiting to avoid this.
- Dynamic Content: The script assumes the product page structure remains consistent. If Amazon changes its layout, the selectors may need to be updated.

---

### License
This project is open-source and available under the MIT License.

---

### Author

 Aravind Kotagiri

---

### Version History

1.0.0: Initial release with basic functionality for scraping product details and saving to JSON.