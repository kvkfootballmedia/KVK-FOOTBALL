import { footballApi } from './src/services/football.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function checkIds() {
  try {
    console.log("Fetching championships list...");
    const data = await footballApi.listChampionships();
    console.log("Total items:", data.pagination[0].items);
    console.log("First 10 results:");
    data.result.slice(0, 10).forEach(c => {
      console.log(`- ${c.name}: ${c.id}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
    if (err.errors) console.error("Details:", err.errors);
  }
}

checkIds();
