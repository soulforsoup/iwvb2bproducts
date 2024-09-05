const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const sheets = [
  {
    url: "https://docs.google.com/spreadsheets/d/1TF2hAiXg5KfLARRnVSdT0YroW3su0f3K-iERs2RZjAw/pub?output=csv&gid=56605794",
    folder: "whole list",
  },
  {
    url: "https://docs.google.com/spreadsheets/d/1TF2hAiXg5KfLARRnVSdT0YroW3su0f3K-iERs2RZjAw/pub?output=csv&gid=247435002",
    folder: "fruits list",
  },
];

async function fetchSheetData(url, folder) {
  try {
    const response = await fetch(url);
    const data = await response.text();

    const rows = data.split("\n").map((row) => row.split(","));
    const headers = rows[0];
    const products = rows.slice(1).map((row) => ({
      productName: row[0] || "",
      unitOfMeasure: row[1] || "",
      salesPrice: row[2] || "",
      indent: row[3].trim().toUpperCase() === "TRUE",
    }));

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, "products.json");
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    console.log(`Data updated successfully in ${filePath}`);
  } catch (error) {
    console.error(`Error fetching data for ${folder}:`, error);
  }
}

async function updateAllSheets() {
  for (const sheet of sheets) {
    await fetchSheetData(sheet.url, sheet.folder);
  }
}

updateAllSheets();
