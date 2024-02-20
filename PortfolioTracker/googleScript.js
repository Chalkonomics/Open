/**
 * @Author: Chalky 
 * @Description: Portfolio tracker using Coin Gecko API & Google Sheets
 * @todo: 
 *  1. Google sheet not uploaded
 * 
 */

const API_KEY = ""            // Register for free at "https://www.coingecko.com/en/api/documentation 
const TABLE_ROW_START = 5;    // Index of 1st table row 
const TABLE_X_OFFSET = 1;     // offset 

const COL_DATE = 2;
const COL_ASSET_NAME = 4;
const COL_QTY = 5;
const COL_PURCHASE_PX = 6;
const COL_FILL_PX = 7;
const COL_SOLD = 8;

const COL_COMPUTE_LATEST_PX = 9;  // This is +1 
const COL_PNL_PC = 10;
const COL_PNL_FINAL = 11;

const COLOR_PROFIT = '#92e9f0'

function updateAssetPrices() {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    for (let i = TABLE_ROW_START; i < values.length; i++) {

        let entry = values[i]
        const shouldUpdate = hasEntry(entry) && !hasSold(entry)

        if (shouldUpdate) {

            const assetName = entry[COL_ASSET_NAME]
            const assetLatestPx = getAssetLatestPx(assetName)

            const qty = entry[COL_QTY]
            const purchasePx = entry[COL_PURCHASE_PX]
            const fillPx = entry[COL_FILL_PX]

            // Calc final profit if sold now 
            const latestAssetPNLFinal = (assetLatestPx * qty) - fillPx

            // Calc % gain so far
            const latestPNLPc = ((assetLatestPx - purchasePx) / purchasePx) * 100

            // Must + 1 to cell number when using 
            sheet.getRange(i + 1, COL_COMPUTE_LATEST_PX + TABLE_X_OFFSET).setValue(assetLatestPx)
            sheet.getRange(i + 1, COL_PNL_PC + TABLE_X_OFFSET).setValue(`${Math.floor(latestPNLPc)}%`)
            sheet.getRange(i + 1, COL_PNL_FINAL + TABLE_X_OFFSET).setValue(latestAssetPNLFinal)

        }

    }
}

function getAssetLatestPx(assetName) {
    const url = makeUrl(assetName)
    const response = UrlFetchApp.fetch(url)
    const responseData = JSON.parse(response.getContentText())
    const latestPx = responseData[assetName].usd
    return latestPx
}

const makeUrl = (assetName) => `https://api.coingecko.com/api/v3/simple/price?ids=${assetName}&vs_currencies=usd&x_cg_demo_api_key=${API_KEY}`
const hasEntry = (row) => row[COL_DATE] !== ""
const hasSold = (row) => row[COL_SOLD] !== ""