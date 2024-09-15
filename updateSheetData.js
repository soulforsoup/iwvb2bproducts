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

function validateProduct(product) {
  const requiredFields = ["productName", "unitOfMeasure", "salesPrice"];
  for (const field of requiredFields) {
    if (!product[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (isNaN(parseFloat(product.salesPrice.replace("$", "")))) {
    throw new Error(`Invalid sales price: ${product.salesPrice}`);
  }
  return true;
}

async function fetchSheetData(url, folder) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();

    const rows = data.split("\n").map((row) => row.split(","));
    if (rows.length < 2) {
      throw new Error("Insufficient data in the sheet");
    }

    const headers = rows[0];
    const products = rows
      .slice(1)
      .map((row) => {
        const product = {
          productName: row[0] || "",
          unitOfMeasure: row[1] || "",
          salesPrice: row[2] || "",
          indent: row[3] ? row[3].trim().toUpperCase() === "TRUE" : false,
        };
        try {
          validateProduct(product);
        } catch (error) {
          console.warn(`Skipping invalid product: ${error.message}`);
          return null;
        }
        return product;
      })
      .filter((product) => product !== null);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, "products.json");
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    console.log(`Data updated successfully in ${filePath}`);
  } catch (error) {
    console.error(`Error fetching data for ${folder}:`, error.message);
    // You might want to add more specific error handling here
    // For example, you could send an alert or log to a monitoring service
  }
}

async function updateAllSheets() {
  for (const sheet of sheets) {
    await fetchSheetData(sheet.url, sheet.folder);
  }
}

updateAllSheets().catch((error) => {
  console.error("An error occurred during the update process:", error.message);
  process.exit(1);
});
