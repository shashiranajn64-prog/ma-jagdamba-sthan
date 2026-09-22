import * as XLSX from 'xlsx';
import { Donation, TempleConfig } from '../types';
import { templeStore } from './store';

export interface GoogleSheetRow {
  receiptNo: string;
  date: string;
  name: string;
  mobile: string;
  gotra: string;
  amount: number;
  paymentMode: string;
  staffId: string;
  status: string;
  screenshotLink: string;
}

/**
 * Format a donation into exact Google Sheet columns:
 * A: Receipt No (MJS-2026-XXXX) | B: Date | C: Name | D: Mobile | E: Gotra
 * F: Amount | G: Payment Mode (UPI/Cash) | H: Staff ID (Kaun laya)
 * I: Status (APPROVED/PENDING) | J: Screenshot Link
 */
export const formatDonationForSheet = (donation: Donation): GoogleSheetRow => {
  return {
    receiptNo: donation.receiptNo || 'MJS-2026-PENDING',
    date: donation.date || new Date().toISOString().split('T')[0],
    name: donation.name,
    mobile: donation.mobile,
    gotra: donation.gotra && donation.gotra.trim() !== '' ? donation.gotra : 'कश्यप / सामान्य',
    amount: donation.amount,
    paymentMode: donation.type === 'CASH' ? 'Cash' : 'UPI',
    staffId: donation.collectedBy
      ? `${donation.collectedBy.staffName} (${donation.collectedBy.staffId})`
      : 'Online Portal',
    status: donation.status,
    screenshotLink: donation.screenshotUrl || donation.receiptLink || '-',
  };
};

/**
 * One Click Excel Download (.xlsx) using SheetJS (xlsx)
 * File Name: Maa-Jagdamba-Donation-Report-{TodayDate}.xlsx
 */
export const exportDonationsToExcel = (donations: Donation[], titlePrefix = 'All') => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const fileName = `Maa-Jagdamba-Donation-Report-${today}.xlsx`;

    // Headers matching requirements
    const headers = [
      'रसीद सं. (Receipt No)',
      'दिनांक (Date)',
      'दानदाता का नाम (Name)',
      'मोबाइल (Mobile)',
      'गोत्र (Gotra)',
      'दान राशि ₹ (Amount)',
      'भुगतान माध्यम (Payment Mode)',
      'संग्रहकर्ता / Staff ID',
      'स्थिति (Status)',
      'स्क्रीनशॉट / रसीद लिंक (Screenshot / Receipt)',
      'संकल्प (Sankalp)',
      'शहर / जिला (City)',
    ];

    const rows = donations.map((d) => [
      d.receiptNo || 'MJS-2026-PENDING',
      d.date,
      d.name,
      d.mobile,
      d.gotra || '-',
      d.amount,
      d.type === 'CASH' ? 'Cash (नकद)' : 'UPI (ऑनलाइन)',
      d.collectedBy ? `${d.collectedBy.staffName} (${d.collectedBy.staffId})` : 'Online Portal',
      d.status,
      d.screenshotUrl || d.receiptLink || '-',
      d.sankalp || '-',
      d.city || '-',
    ]);

    // Build worksheet with title block
    const wsData = [
      ['श्री माँ जगदंबा स्थान, मथुरापुर, मुजफ्फरपुर - दान संग्रह रिपोर्ट'],
      [`रिपोर्ट निर्माण दिनांक: ${today} | कुल रिकॉर्ड: ${donations.length} | कुल राशि: ₹${donations.reduce((sum, d) => sum + (d.status === 'APPROVED' ? d.amount : 0), 0).toLocaleString('en-IN')}`],
      [],
      headers,
      ...rows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set Column Widths for readability
    ws['!cols'] = [
      { wch: 18 }, // Receipt No
      { wch: 12 }, // Date
      { wch: 22 }, // Name
      { wch: 14 }, // Mobile
      { wch: 14 }, // Gotra
      { wch: 14 }, // Amount
      { wch: 16 }, // Mode
      { wch: 20 }, // Staff
      { wch: 12 }, // Status
      { wch: 35 }, // Link
      { wch: 25 }, // Sankalp
      { wch: 16 }, // City
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Donation Report');

    XLSX.writeFile(wb, fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Failed to export Excel report:', error);
    throw error;
  }
};

/**
 * Sync single donation row to Google Sheet
 * Works via Google Apps Script Webhook or SheetDB API
 */
export const syncDonationToGoogleSheet = async (
  donation: Donation,
  config?: TempleConfig
): Promise<{ success: boolean; message: string }> => {
  const currentConfig = config || templeStore.getConfig();
  const webhookUrl = currentConfig.googleSheetWebhookUrl?.trim();

  const row = formatDonationForSheet(donation);

  if (!webhookUrl) {
    // If webhook isn't configured, store in local pending sheet sync
    return {
      success: false,
      message: 'Google Sheet Webhook URL कॉन्फ़िगर नहीं है। कृपया Admin Settings में लिंक सेट करें।',
    };
  }

  try {
    // Check if it's a SheetDB URL or Apps Script URL
    if (webhookUrl.includes('sheetdb.io')) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [row] }),
      });
      if (response.ok) {
        return { success: true, message: 'Google Sheet में सफलतापूर्वक दर्ज हुआ!' };
      }
    } else {
      // Standard Google Apps Script Webhook (needs mode: no-cors or standard text post)
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Standard Apps script redirect requirement
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(row),
      });
      return { success: true, message: 'Google Sheet में सिंक अनुरोध भेजा गया!' };
    }

    return { success: true, message: 'Google Sheet Sync सफल!' };
  } catch (error) {
    console.warn('Google Sheet Sync warning:', error);
    return { success: false, message: 'Google Sheet Sync में त्रुटि आई।' };
  }
};

/**
 * Batch sync all donations to Google Sheet
 */
export const syncAllDonationsToGoogleSheet = async (
  donations: Donation[],
  config?: TempleConfig
): Promise<{ success: boolean; count: number; message: string }> => {
  const currentConfig = config || templeStore.getConfig();
  const webhookUrl = currentConfig.googleSheetWebhookUrl?.trim();

  if (!webhookUrl) {
    return {
      success: false,
      count: 0,
      message: 'Google Sheet Webhook URL सेट नहीं है।',
    };
  }

  const rows = donations.map(formatDonationForSheet);

  try {
    if (webhookUrl.includes('sheetdb.io')) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: rows }),
      });
      if (response.ok) {
        return { success: true, count: rows.length, message: `${rows.length} दान रिकॉर्ड Google Sheet में सिंक हुए!` };
      }
    } else {
      // Batch send to Apps Script
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ batch: rows }),
      });
      return { success: true, count: rows.length, message: `${rows.length} दान रिकॉर्ड Google Sheet में भेजे गए!` };
    }

    return { success: true, count: rows.length, message: 'सिंक पूर्ण हुआ!' };
  } catch (err) {
    console.error('Batch sync failed:', err);
    return { success: false, count: 0, message: 'Google Sheet सिंक विफल रहा।' };
  }
};

/**
 * Default Google Apps Script code snippet for the Admin to paste in Google Sheets
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// -------------------------------------------------------------
// माँ जगदंबा स्थान - Google Sheet Auto Sync Script
// -------------------------------------------------------------
// निर्देश:
// 1. अपनी Google Sheet खोलें: https://docs.google.com/spreadsheets
// 2. मेन्यू में जाएँ: Extensions > Apps Script
// 3. सारा पुराना कोड हटाकर यह कोड पेस्ट करें
// 4. ऊपर "Deploy" > "New deployment" पर क्लिक करें
// 5. Select type: "Web app"
// 6. Who has access: "Anyone" (महत्वपूर्ण)
// 7. "Deploy" पर क्लिक करें और Web App URL कॉपी करके Admin Panel में डालें।
// -------------------------------------------------------------

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Receipt No",
        "Date",
        "Name",
        "Mobile",
        "Gotra",
        "Amount",
        "Payment Mode",
        "Staff ID",
        "Status",
        "Screenshot Link"
      ]);
      // Make header row bold
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#FFF3CD");
    }

    var data = JSON.parse(e.postData.contents);

    // If batch rows
    if (data.batch && Array.isArray(data.batch)) {
      data.batch.forEach(function(item) {
        sheet.appendRow([
          item.receiptNo || "MJS-2026-PENDING",
          item.date || "",
          item.name || "",
          item.mobile || "",
          item.gotra || "-",
          item.amount || 0,
          item.paymentMode || "",
          item.staffId || "Online",
          item.status || "",
          item.screenshotLink || "-"
        ]);
      });
    } else {
      // Single row
      sheet.appendRow([
        data.receiptNo || "MJS-2026-PENDING",
        data.date || "",
        data.name || "",
        data.mobile || "",
        data.gotra || "-",
        data.amount || 0,
        data.paymentMode || "",
        data.staffId || "Online",
        data.status || "",
        data.screenshotLink || "-"
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Maa Jagdamba Sthan Google Sheet Sync Active");
}
`;
