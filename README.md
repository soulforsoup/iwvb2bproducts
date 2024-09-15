# IWV B2B Products Updater

## What This Project Does

This project automatically updates product information for the IWV B2B (Business-to-Business) platform. It fetches the latest product data from Google Sheets and makes it available in an easy-to-use format for the platform.

## Key Features

- Automatically retrieves up-to-date product information from Google Sheets
- Converts the data into a structured JSON format, which is easier for computers to process
- Creates two separate product lists: a complete list and a fruits-only list
- Updates the product information regularly without manual intervention
- Allows for manual updates when needed

## Why It's Useful

- Ensures that the B2B platform always has the most current product information
- Saves time by automating what would otherwise be a manual update process
- Reduces the chance of errors that can occur with manual data entry
- Provides flexibility with both scheduled and on-demand updates

## How It Works

1. The system connects to specified Google Sheets containing product data
2. It reads the information from these sheets
3. The data is processed and organized into a structured format
4. Two separate files are created and updated:
   - A complete list of all products
   - A list containing only fruit products
5. These files are then saved in the project repository

## Update Schedule

The product information is automatically updated based on a defined schedule. Currently, it's set to run:

- Twice daily at 6 AM and 3 PM UTC
- Whenever changes are pushed to the `main` or `dev` branches of the project
- When manually triggered by a project maintainer

### Understanding and Modifying the Update Schedule

The update schedule is controlled by a cron expression in the GitHub Actions workflow file. Here's how it works:

1. The schedule is defined in `.github/workflows/update-sheet-data.yml`
2. The current cron expression is: `0 6,15 * * *`

What this means:
- `0`: At minute 0 (top of the hour)
- `6,15`: At 6 AM and 3 PM UTC
- `* * *`: Every day, every month, every day of the week

To modify the schedule:

1. Open `.github/workflows/update-sheet-data.yml`
2. Find the `schedule` section under `on:`
3. Modify the `cron` expression

Common cron examples:
- Every hour: `0 * * * *`
- Twice daily (6 AM and 6 PM UTC): `0 6,18 * * *`
- Once daily at midnight UTC: `0 0 * * *`
- Every 3 hours: `0 */3 * * *`

Note: Increasing the frequency will use more of your GitHub Actions minutes. Ensure you stay within your account's limits.

## Step-by-Step Guide to Using This Repository

### For Users

1. Accessing Updated Product Data:
   - The latest product data is always available in two JSON files:
     - `whole list/products.json`: Complete product list
     - `fruits list/products.json`: Fruits-only product list
   - You can view these files directly on GitHub or download them for use in your applications

2. Checking Update History:
   - Go to the repository's main page
   - Click on the "Commits" link near the top
   - This shows a history of all updates, including when product data was last refreshed

3. Verifying Automatic Updates:
   - Click on the "Actions" tab in the repository
   - Look for the "Update Sheet Data" workflow
   - You'll see a list of recent runs, showing when the data was last updated automatically

4. Requesting a Manual Update:
   - Go to the "Actions" tab
   - Click on "Update Sheet Data" workflow
   - Press the "Run workflow" button
   - Select the branch (usually 'main') and click "Run workflow"

### For Contributors and Developers

1. Setting Up the Project Locally:
   a. Clone the repository:
      ```
      git clone https://github.com/[username]/iwvb2bproducts.git
      cd iwvb2bproducts
      ```
   b. Install dependencies:
      ```
      npm install
      ```

2. Configuring Google Sheets API:
   a. Go to Google Cloud Console and create a new project
   b. Enable Google Sheets API for your project
   c. Create a Service Account Key for the Sheets API
   d. Download the JSON key file

3. Setting Up GitHub Secrets:
   a. In the repository, go to Settings > Secrets
   b. Add a new secret named `GOOGLE_SHEETS_API_KEY`
   c. Paste the content of your Google Sheets API JSON key file as the value

4. Creating a Personal Access Token (PAT):
   a. In GitHub, go to Settings > Developer settings > Personal access tokens
   b. Generate a new token with 'repo' access
   c. Add this token as a secret named `PAT` in the repository settings

5. Modifying the Update Script:
   - If needed, edit `updateSheetData.mjs` to change how data is processed

6. Changing the Update Schedule:
   a. Open `.github/workflows/update-sheet-data.yml`
   b. Modify the `cron` expression under the `schedule` section

7. Testing Changes:
   a. Make your changes in a new branch
   b. Push the branch and create a pull request
   c. GitHub Actions will run automatically on the pull request

8. Deploying Changes:
   - Once your pull request is approved and merged, the changes will be active on the main branch

9. Monitoring Updates:
   - Regularly check the "Actions" tab to ensure updates are running successfully
   - Review the generated JSON files to verify data accuracy

### Troubleshooting

- If updates fail, check the Actions log for error messages
- Ensure your Google Sheets API key and PAT are up to date
- Verify that the Google Sheet's sharing settings allow access to your service account

## Important Files

- `updateSheetData.mjs`: The main script that fetches and processes the data
- `.github/workflows/update-sheet-data.yml`: Configures when and how the update process runs
- `whole list/products.json`: Contains the complete product list
- `fruits list/products.json`: Contains the fruits-only product list

## Detailed Setup for Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API for your project
4. Create credentials (Service Account Key) for the Sheets API
5. Download the JSON key file
6. In your GitHub repository, go to Settings > Secrets
7. Add a new secret named `GOOGLE_SHEETS_API_KEY`
8. Paste the entire content of the JSON key file as the value of this secret

## Data Sanitization and Security

This project implements several security measures to ensure the integrity and safety of the data:

1. Input Sanitization:
   - All input data from the Google Sheets is sanitized before processing.
   - A custom sanitization function removes potentially dangerous characters while preserving Unicode characters, spaces, and common punctuation.
   - The sanitization regex used is: `/[\u0000-\u001F\u007F-\u009F<>]/g`
   - This approach helps prevent XSS (Cross-Site Scripting) and other injection attacks.

2. Secure Logging:
   - The project uses a custom `secureLog` function to handle logging.
   - Sensitive information is masked in logs to prevent accidental exposure.
   - GitHub Actions syntax is used to create warning annotations for sensitive logs.

3. Checksum Verification:
   - Before updating the JSON files, the script calculates an MD5 checksum of the new data.
   - This checksum is compared with the checksum of the existing data to determine if an update is necessary.
   - This approach reduces unnecessary commits and helps maintain data integrity.

4. Environment Variable Security:
   - Sensitive information such as API keys and URLs are stored as GitHub Secrets.
   - These secrets are accessed via environment variables in the GitHub Actions workflow.

5. Error Handling:
   - The script includes comprehensive error handling to catch and log issues without exposing sensitive details.

## Current Implementation Details

- The script (`updateSheetData.mjs`) is written in modern JavaScript (ES6+) and runs in a Node.js environment.
- It uses the `node-fetch` library to make HTTP requests to the Google Sheets.
- The script processes two separate sheets: a complete product list and a fruits-only list.
- Data is fetched, sanitized, processed, and then saved as JSON files in the repository.
- The GitHub Actions workflow (`update-sheet-data.yml`) is set to run on a schedule, on pushes to main/dev branches, and can be manually triggered.
- The workflow uses a Personal Access Token (PAT) for authentication to allow for pushing changes back to the repository.
