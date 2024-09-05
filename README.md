# IWV B2B Products Updater

This project automatically updates product data from Google Sheets for the IWV B2B platform.

## Features

- Fetches product data from specified Google Sheets
- Converts CSV data to structured JSON
- Saves updated product lists to separate folders
- Runs on a schedule via GitHub Actions
- Supports manual triggering of updates

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up a Personal Access Token (PAT) in GitHub with repo access
4. Add the PAT as a repository secret named `PAT`

## Usage

The update process runs automatically on the following schedule:
- 6 AM and 3 PM UTC (2 PM and 11 PM Singapore time) daily
- On every push to `main` or `dev` branches

To manually trigger an update:
1. Go to the "Actions" tab in the GitHub repository
2. Select the "Update Sheet Data" workflow
3. Click "Run workflow"

## File Structure

- `updateSheetData.js`: Main script for fetching and processing data
- `.github/workflows/update-sheet-data.yml`: GitHub Actions workflow configuration
- `whole list/products.json`: Full product list
- `fruits list/products.json`: Fruits-only product list
