const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const crypto = require("crypto");

function sanitizeInput(input) {
  return input.replace(/[\u0000-\u001F\u007F-\u009F<>]/g, "");
}

function checksum(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function secureLog(message, sensitiveInfo = false) {
  if (sensitiveInfo) {
    console.log("Sensitive information logged. Check secure logs.");
  } else {
    console.log(message);
  }
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

    const products = rows.slice(1).map((row) => ({
      productName: sanitizeInput(row[0] || ""),
      unitOfMeasure: sanitizeInput(row[1] || ""),
      salesPrice: sanitizeInput(row[2] || ""),
      indent: row[3]
        ? sanitizeInput(row[3]).trim().toUpperCase() === "TRUE"
        : false,
    }));

    const filePath = path.join(folder, "products.json");
    const oldData = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf8")
      : "";
    const oldChecksum = checksum(oldData);
    const newData = JSON.stringify(products, null, 2);
    const newChecksum = checksum(newData);

    if (newChecksum !== oldChecksum) {
      fs.writeFileSync(filePath, newData);
      secureLog(`Data updated successfully in ${filePath}`);
    } else {
      secureLog(`No changes detected for ${filePath}`);
    }
  } catch (error) {
    secureLog(`Error fetching data for ${folder}:`, true);
    secureLog(error.message);
  }
}

// Use environment variables for sheet URLs
const sheets = [
  { url: process.env.WHOLE_LIST_SHEET_URL, folder: "whole list" },
  { url: process.env.FRUITS_LIST_SHEET_URL, folder: "fruits list" },
];

async function updateAllSheets() {
  for (const sheet of sheets) {
    await fetchSheetData(sheet.url, sheet.folder);
  }
}

updateAllSheets().catch((error) => {
  secureLog("An error occurred during the update process:", true);
  secureLog(error.message);
  process.exit(1);
});
