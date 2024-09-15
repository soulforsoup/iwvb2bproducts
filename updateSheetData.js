import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for required environment variables
const WHOLE_LIST_SHEET_URL = process.env.WHOLE_LIST_SHEET_URL;
const FRUITS_LIST_SHEET_URL = process.env.FRUITS_LIST_SHEET_URL;

if (!WHOLE_LIST_SHEET_URL || !FRUITS_LIST_SHEET_URL) {
  console.error(
    "Error: Missing required environment variables. Please set WHOLE_LIST_SHEET_URL and FRUITS_LIST_SHEET_URL.",
  );
  process.exit(1);
}

const sheets = [
  { url: WHOLE_LIST_SHEET_URL, folder: "whole list" },
  { url: FRUITS_LIST_SHEET_URL, folder: "fruits list" },
];

function sanitizeInput(input) {
  // This regex will only remove control characters and other potentially dangerous characters
  // while preserving Unicode characters, spaces, and common punctuation
  return input.replace(/[\u0000-\u001F\u007F-\u009F<>]/g, "");
}

function checksum(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function secureLog(message, sensitiveInfo = false) {
  if (sensitiveInfo) {
    // Use GitHub Actions syntax to create a warning annotation
    console.log(`::warning::Sensitive information logged`);
    // Mask the sensitive information in the log
    console.log(`::add-mask::${message}`);
    console.log(message);
  } else {
    console.log(message);
  }
}

async function fetchSheetData(url, folder) {
  try {
    secureLog(`Fetching data for ${folder}`);
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

    const filePath = path.join(__dirname, folder, "products.json");
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

async function updateAllSheets() {
  for (const sheet of sheets) {
    await fetchSheetData(sheet.url, sheet.folder);
  }
}

try {
  await updateAllSheets();
} catch (error) {
  secureLog("An error occurred during the update process:", true);
  secureLog(error.message);
  process.exit(1);
}
