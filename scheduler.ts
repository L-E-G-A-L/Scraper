var cron = require('node-cron');
import {scrapeAllProducts} from "./scraper";
import { targets } from "./targets";

cron.schedule('0 * * * *', async () =>  {
    await scrapeAllProducts(targets);
  });