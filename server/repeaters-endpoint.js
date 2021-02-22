// import { spreadSheetCredentials } from "../config/spreadsheet-credentials.js";
import { GoogleSpreadsheet } from "google-spreadsheet";

export async function getAll(req, res, next) {
  const rows = await getRows();
  res.json(rows);
}

async function getSheet() {
  const doc = new GoogleSpreadsheet(
    "1Vs91c_Fiee7X7HgXeJZ2s7F8Zd5934b3QCabbh6UPtw"
  );
  // await doc.useServiceAccountAuth(spreadSheetCredentials);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  return doc.sheetsByIndex[0];
}

async function getRows() {
  const rowsCount = 2;
  const sheet = await getSheet();
  await sheet.loadCells("A2:G3");
  const rows = [...Array(rowsCount).keys()]
    .map((i) => i + 1)
    .map((rowIndex) => {
      return {
        name: sheet.getCell(rowIndex, 0).value,
        signal: sheet.getCell(rowIndex, 1).value,
        frequency: sheet.getCell(rowIndex, 2).value,
        diff: sheet.getCell(rowIndex, 3).value,
        subtone: sheet.getCell(rowIndex, 4).value,
        latitude: sheet.getCell(rowIndex, 5).value,
        longitude: sheet.getCell(rowIndex, 6).value,
      };
    });
  return rows;
}
