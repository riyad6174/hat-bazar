import { google } from 'googleapis';

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Raw request body:', req.body);
    if (!req.body || typeof req.body !== 'object') {
      console.error('Invalid request body:', req.body);
      return res
        .status(400)
        .json({ message: 'Request body is missing or invalid' });
    }

    const {
      name,
      phone,
      district,
      address,
      items,
      totalPrice,
      shippingCharge,
      grandTotal,
      orderId,
      orderDate,
      submissionTime,
      sheetName,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !district ||
      !address ||
      !items ||
      !totalPrice ||
      !shippingCharge ||
      !grandTotal ||
      !orderId ||
      !orderDate ||
      !submissionTime ||
      !sheetName
    ) {
      return res.status(400).json({
        message:
          'Missing required fields: name, phone, district, address, items, totalPrice, shippingCharge, grandTotal, orderId, orderDate, submissionTime, and sheetName are required',
      });
    }

    // Parse items (stored as JSON string)
    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid items format: must be valid JSON',
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check if sheet has headers (row 1 remains untouched/ fixed)
    const checkSheet = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:K1`,
    });

    if (!checkSheet.data.values) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:K1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS', // Ensures safe insertion if needed
        resource: {
          values: [
            [
              '', // Keep the first column empty
              'Items',
              'Phone',
              'Name',
              'District',
              'Address',
              'OrderID',
              'OrderDate',
              'TotalPrice',
              'ShippingCharge',
              'GrandTotal',
            ],
          ],
        },
      });
    }

    // Format items for spreadsheet
    const itemsString = parsedItems
      .map(
        (item) =>
          `${item.title} (Color: ${item.selectedColor}, Qty: ${item.quantity}, Price: ${item.price})`
      )
      .join('; ');

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      // Fix: Include headers (row 1) + data columns for accurate table detection; appends after last data row
      range: `${sheetName}!A1:K`,
      valueInputOption: 'USER_ENTERED',
      // Ensures new rows are inserted at the end (after row 1 headers), no overwrites
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          [
            '', // Blank first column
            itemsString,
            phone,
            name,
            district || '',
            address || '',
            orderId || '',
            orderDate,
            totalPrice || 0,
            shippingCharge || 0,
            grandTotal || 0,
          ],
        ],
      },
    });

    console.log(`Rows updated: ${response.data.updates.updatedCells}`);
    // Optional: Log tableRange from response to verify (e.g., console.log(response.data.tableRange))

    return res.status(200).json({
      message: 'Order data submitted successfully!',
      data: {
        phone,
        name,
        district,
        address,
        items: parsedItems,
        totalPrice,
        shippingCharge,
        grandTotal,
        orderId,
        orderDate,
      },
    });
  } catch (error) {
    console.error('API error:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: 'Failed to submit order data',
      error: error.message,
    });
  }
};
