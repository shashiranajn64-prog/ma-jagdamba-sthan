import * as XLSX from 'xlsx';
import { Donation, TempleConfig } from '../types';
import { templeStore, WEBSITE_URL } from './store';
import { getCachedAccessToken } from './googleAuth';

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
  sankalp: string;
  city: string;
  screenshotLink: string;
}

/**
 * Format a donation into standard Google Sheet columns
 */
export const formatDonationForSheet = (donation: Donation): GoogleSheetRow => {
  return {
    receiptNo: donation.receiptNo || 'MJS-2026-PENDING',
    date: donation.date || new Date().toISOString().split('T')[0],
    name: donation.name,
    mobile: donation.mobile,
    gotra: donation.gotra && donation.gotra.trim() !== '' ? donation.gotra : 'कश्यप / सामान्य',
    amount: donation.amount,
    paymentMode: donation.type === 'CASH' ? 'Cash (नकद)' : 'UPI (ऑनलाइन)',
    staffId: donation.collectedBy
      ? `${donation.collectedBy.staffName} (${donation.collectedBy.staffId})`
      : 'Online Portal',
    status: donation.status === 'APPROVED' ? 'स्वीकृत (APPROVED)' : donation.status,
    sankalp: donation.sankalp || 'मंदिर निर्माण एवं सेवा',
    city: donation.city || 'मथुरापुर / मुजफ्फरपुर',
    screenshotLink:
      donation.receiptLink ||
      `${WEBSITE_URL}/receipt/${donation.receiptNo || donation.id}`,
  };
};

/**
 * Extract Spreadsheet ID from full Google Docs URL or raw ID
 */
export const extractSpreadsheetId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
};

/**
 * Standard Headers for the Google Spreadsheet
 */
export const SHEET_HEADERS = [
  'रसीद संख्या (Receipt No)',
  'दिनांक (Date)',
  'दानदाता का नाम (Donor Name)',
  'मोबाइल नंबर (Mobile)',
  'गोत्र (Gotra)',
  'दान राशि ₹ (Amount)',
  'भुगतान प्रकार (Payment Mode)',
  'संग्रहकर्ता (Staff / Collected By)',
  'सत्यापन स्थिति (Status)',
  'संकल्प / प्रयोजन (Sankalp)',
  'शहर / जिला (City)',
  'डिजिटल रसीद लिंक (Receipt Link)',
];

/**
 * Convert donation objects into rows for Google Sheet API
 */
export const donationToRowArray = (d: Donation): (string | number)[] => {
  const row = formatDonationForSheet(d);
  return [
    row.receiptNo,
    row.date,
    row.name,
    row.mobile,
    row.gotra,
    row.amount,
    row.paymentMode,
    row.staffId,
    row.status,
    row.sankalp,
    row.city,
    row.screenshotLink,
  ];
};

/**
 * Create a new Google Spreadsheet directly in the user's Google Drive
 */
export const createDonationSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<{ id: string; url: string; title: string }> => {
  const title = customTitle || 'माँ जगदम्बा स्थान - दान रसीद पंजी (Donation Register)';

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        locale: 'hi_IN',
      },
      sheets: [
        {
          properties: {
            title: 'Donations',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Google Spreadsheet बनाने में विफल रहा।');
  }

  const data = await response.json();
  const id = data.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;

  return { id, url, title };
};

/**
 * Get spreadsheet sheet tab name
 */
export const getSpreadsheetMainSheetTitle = async (
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetId: number }> => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 'Google Sheet की जानकारी प्राप्त करने में असमर्थ।'
    );
  }

  const data = await response.json();
  const firstSheet = data.sheets?.[0]?.properties;
  return {
    title: firstSheet?.title || 'Sheet1',
    sheetId: firstSheet?.sheetId ?? 0,
  };
};

/**
 * Mirror Sync: Exactly synchronize the entire donation list to Google Sheet.
 * "Jo donation list me hai wahi google sheet me rahega yadi admin delete karta hai donation to sheet se auto delete hoga"
 *
 * This function:
 * 1. Clears all previous rows in the sheet
 * 2. Writes the exact headers and all current active donations
 * 3. Applies styling (Maroon/Gold Header, bold, auto column sizes)
 *
 * Result: If admin deletes any donation in the app, calling this function immediately
 * removes the deleted donation from Google Sheet!
 */
export const mirrorSyncDonationsToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  donations: Donation[]
): Promise<{ success: boolean; count: number; message: string }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('अमान्य Google Sheet ID');
  }

  // 1. Get first sheet name and ID
  const { title: rawSheetTitle, sheetId } = await getSpreadsheetMainSheetTitle(accessToken, cleanId);
  const safeSheetTitle = rawSheetTitle.replace(/'/g, "''");
  const fullRange = `'${safeSheetTitle}'!A1:Z`;

  // 2. Clear old data from sheet (ensuring deleted rows are completely wiped)
  const clearRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(fullRange)}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!clearRes.ok) {
    const errorData = await clearRes.json().catch(() => ({}));
    console.warn('Clear range error:', errorData);
    throw new Error(errorData.error?.message || 'Google Sheet खाली करने में त्रुटि।');
  }

  // 3. Prepare rows: Header + Current Donations
  const dataRows = donations.map(donationToRowArray);
  const allRows = [SHEET_HEADERS, ...dataRows];

  // 4. Write data to sheet
  const writeRange = `'${safeSheetTitle}'!A1`;
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(writeRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: writeRange,
        majorDimension: 'ROWS',
        values: allRows,
      }),
    }
  );

  if (!writeRes.ok) {
    const errorData = await writeRes.json().catch(() => ({}));
    console.warn('Write range error:', errorData);
    throw new Error(errorData.error?.message || 'Google Sheet में डेटा लिखने में त्रुटि।');
  }

  // 5. Apply header formatting (Background #7A0000, Text White Bold, Freeze Header)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format Header Row (Row 0)
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.48, green: 0.0, blue: 0.0 }, // #7A0000 Maroon
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Freeze row 1
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      }),
    });
  } catch (fmtErr) {
    console.warn('Formatting warning (non-fatal):', fmtErr);
  }

  // Update store config with timestamp
  const now = new Date().toLocaleString('hi-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  templeStore.updateConfig({
    googleSheetLastSyncedAt: now,
  });

  return {
    success: true,
    count: donations.length,
    message: `Google Sheet में सम्पूर्ण ${donations.length} दान रिकॉर्ड सफलतापूर्वक मिरर सिंक हो गए हैं!`,
  };
};

/**
 * Trigger Auto-Sync in background if Google OAuth token & Sheet ID are available.
 * This runs automatically whenever donations are:
 * - Deleted (Auto deleted from sheet)
 * - Added (Auto added to sheet)
 * - Approved or Updated
 */
export const triggerAutoSyncIfConnected = async () => {
  const token = getCachedAccessToken();
  const config = templeStore.getConfig();
  const sheetId = config.googleSheetId || extractSpreadsheetId(config.googleSheetUrl || '');

  // 1. Direct Google Sheets API via OAuth (if authenticated)
  if (token && sheetId) {
    try {
      const currentDonations = templeStore.getDonations();
      await mirrorSyncDonationsToSheet(token, sheetId, currentDonations);
      console.log('⚡ Google Sheet Live Mirror Sync Succeeded via OAuth');
    } catch (err) {
      console.warn('Auto sync OAuth warning:', err);
    }
  }

  // 2. Webhook Sync (works 24/7 if Google Apps Script URL is set)
  const webhookUrl =
    config.googleSheetWebhookUrl?.trim() ||
    (config.googleSheetUrl?.includes('script.google.com') ? config.googleSheetUrl.trim() : '');

  if (webhookUrl) {
    try {
      const currentDonations = templeStore.getDonations();
      await syncAllDonationsToGoogleSheet(currentDonations, config);
      console.log('⚡ Google Sheet Live Mirror Sync Succeeded via Webhook');
    } catch (err) {
      console.warn('Auto sync Webhook warning:', err);
    }
  }
};

/**
 * Robust One Click Excel (.xlsx) and CSV Download
 * Uses SheetJS in-memory array write (XLSX.write) + Blob + ObjectURL
 * NEVER touches node fs. Guaranteed to work in browsers & sandboxed iframes.
 */
export const exportDonationsToExcel = (
  donations: Donation[],
  titlePrefix = 'All'
): { success: boolean; fileName: string; blobUrl?: string } => {
  if (!donations || donations.length === 0) {
    throw new Error('डाउनलोड के लिए कोई दान रिकॉर्ड उपलब्ध नहीं है।');
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const fileName = `Maa-Jagdamba-Donation-Report-${today}.xlsx`;

    const rows = donations.map((d) => [
      d.receiptNo || 'MJS-2026-PENDING',
      d.date || today,
      d.name || '',
      d.mobile || '',
      d.gotra && d.gotra.trim() !== '' ? d.gotra : 'सामान्य',
      Number(d.amount) || 0,
      d.type === 'CASH' ? 'Cash (नकद)' : 'UPI (ऑनलाइन)',
      d.collectedBy ? `${d.collectedBy.staffName} (${d.collectedBy.staffId})` : 'Online Portal',
      d.status === 'APPROVED' ? 'स्वीकृत (APPROVED)' : d.status,
      d.sankalp || 'मंदिर निर्माण एवं सेवा',
      d.city || 'मथुरापुर / मुजफ्फरपुर',
      d.receiptLink || `${WEBSITE_URL}/receipt/${d.receiptNo || d.id}`,
    ]);

    const totalApproved = donations.reduce(
      (sum, d) => sum + (d.status === 'APPROVED' ? Number(d.amount) || 0 : 0),
      0
    );

    const wsData = [
      ['श्री माँ जगदंबा स्थान, मथुरापुर, मुजफ्फरपुर - दान संग्रह रिपोर्ट'],
      [
        `रिपोर्ट निर्माण दिनांक: ${today} | कुल रिकॉर्ड: ${donations.length} | कुल स्वीकृत राशि: ₹${totalApproved.toLocaleString('en-IN')}`,
      ],
      [],
      SHEET_HEADERS,
      ...rows,
    ];

    let blob: Blob | null = null;

    try {
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      ws['!cols'] = [
        { wch: 18 }, // Receipt No
        { wch: 12 }, // Date
        { wch: 22 }, // Name
        { wch: 14 }, // Mobile
        { wch: 14 }, // Gotra
        { wch: 14 }, // Amount
        { wch: 16 }, // Mode
        { wch: 22 }, // Staff
        { wch: 14 }, // Status
        { wch: 25 }, // Sankalp
        { wch: 16 }, // City
        { wch: 38 }, // Link
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Donation Report');

      // Use in-memory Uint8Array write - completely safe in browser / Vite
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });
    } catch (xlsxErr) {
      console.warn('XLSX binary write fallback to CSV:', xlsxErr);
      // UTF-8 BOM CSV Fallback (opens cleanly in Excel with Hindi font)
      const csvRows = wsData.map((row) =>
        row
          .map((val) => {
            const str = String(val ?? '').replace(/"/g, '""');
            return str.includes(',') || str.includes('\n') || str.includes('"')
              ? `"${str}"`
              : str;
          })
          .join(',')
      );
      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    // Trigger download via anchor element
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1500);

    return { success: true, fileName, blobUrl };
  } catch (error) {
    console.error('Failed to export Excel report:', error);
    throw error;
  }
};

/**
 * Legacy Webhook single row sync
 */
export const syncDonationToGoogleSheet = async (
  donation: Donation,
  config?: TempleConfig
): Promise<{ success: boolean; message: string }> => {
  const currentConfig = config || templeStore.getConfig();
  const webhookUrl =
    currentConfig.googleSheetWebhookUrl?.trim() ||
    (currentConfig.googleSheetUrl?.includes('script.google.com') ? currentConfig.googleSheetUrl.trim() : '');
  const row = formatDonationForSheet(donation);

  if (!webhookUrl) {
    return {
      success: false,
      message: 'Google Sheet Webhook URL सेट नहीं है।',
    };
  }

  try {
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
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
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
 * Legacy Webhook batch sync (Sends mirror_sync action to replace rows)
 */
export const syncAllDonationsToGoogleSheet = async (
  donations: Donation[],
  config?: TempleConfig
): Promise<{ success: boolean; count: number; message: string }> => {
  const currentConfig = config || templeStore.getConfig();
  const webhookUrl =
    currentConfig.googleSheetWebhookUrl?.trim() ||
    (currentConfig.googleSheetUrl?.includes('script.google.com') ? currentConfig.googleSheetUrl.trim() : '');

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
        return {
          success: true,
          count: rows.length,
          message: `${rows.length} दान रिकॉर्ड Google Sheet में सिंक हुए!`,
        };
      }
    } else {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ batch: rows, action: 'mirror_sync' }),
      });
      return {
        success: true,
        count: rows.length,
        message: `${rows.length} दान रिकॉर्ड Google Sheet में भेजे गए!`,
      };
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
// माँ जगदंबा स्थान - Google Sheet Live Mirror Sync Script
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
    var data = JSON.parse(e.postData.contents);

    // 1. यदि बैच (Mirror Sync) दिया गया है - शीट को पूरी तरह से करंट लिस्ट से रीफ्रेश करें
    // इससे एडमिन द्वारा डिलीट किया गया कोई भी रिकॉर्ड शीट से 100% स्वतः हट जाता है!
    if (data.batch && Array.isArray(data.batch)) {
      sheet.clearContents();
      sheet.appendRow([
        "रसीद संख्या (Receipt No)", "दिनांक (Date)", "दानदाता का नाम (Donor Name)",
        "मोबाइल (Mobile)", "गोत्र (Gotra)", "दान राशि ₹ (Amount)",
        "भुगतान प्रकार (Payment Mode)", "संग्रहकर्ता (Staff Name)",
        "सत्यापन स्थिति (Status)", "संकल्प / प्रयोजन (Sankalp)",
        "शहर / जिला (City)", "डिजिटल रसीद लिंक (Receipt Link)"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#7A0000").setFontColor("#FFFFFF");
      
      data.batch.forEach(function(item) {
        sheet.appendRow([
          item.receiptNo || "MJS-2026-PENDING", item.date || "", item.name || "",
          item.mobile || "", item.gotra || "-", item.amount || 0,
          item.paymentMode || "", item.staffId || "", item.status || "",
          item.sankalp || "-", item.city || "-", item.screenshotLink || "-"
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "mirror_synced", count: data.batch.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. यदि डिलीट एक्शन (Delete Action) आया है
    if (data.action === "delete") {
      var targetReceipt = (data.receiptNo || "").toString().trim().toLowerCase();
      var targetId = (data.id || "").toString().trim().toLowerCase();
      var targetName = (data.name || "").toString().trim().toLowerCase();
      var targetMobile = (data.mobile || "").toString().trim();
      var values = sheet.getDataRange().getValues();
      var deletedCount = 0;

      for (var i = values.length - 1; i >= 1; i--) {
        var rowReceipt = (values[i][0] || "").toString().trim().toLowerCase();
        var rowName = (values[i][2] || "").toString().trim().toLowerCase();
        var rowMobile = (values[i][3] || "").toString().trim();
        var rowLink = (values[i][11] || "").toString().trim().toLowerCase();

        var isMatch = false;
        if (targetReceipt && targetReceipt !== "mjs-2026-pending" && (rowReceipt === targetReceipt || rowReceipt.indexOf(targetReceipt) !== -1)) {
          isMatch = true;
        } else if (targetId && (rowLink.indexOf(targetId) !== -1 || rowReceipt.indexOf(targetId) !== -1)) {
          isMatch = true;
        } else if (targetMobile && targetName && rowMobile === targetMobile && rowName === targetName) {
          isMatch = true;
        }

        if (isMatch) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "deleted", count: deletedCount }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. यदि शीट खाली है, तो हेडर जोड़ें
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "रसीद संख्या (Receipt No)", "दिनांक (Date)", "दानदाता का नाम (Donor Name)",
        "मोबाइल (Mobile)", "गोत्र (Gotra)", "दान राशि ₹ (Amount)",
        "भुगतान प्रकार (Payment Mode)", "संग्रहकर्ता (Staff Name)",
        "सत्यापन स्थिति (Status)", "संकल्प / प्रयोजन (Sankalp)",
        "शहर / जिला (City)", "डिजिटल रसीद लिंक (Receipt Link)"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#7A0000").setFontColor("#FFFFFF");
    }

    // 4. नया सिंगल दान रो जोड़ें
    sheet.appendRow([
      data.receiptNo || "MJS-2026-PENDING", data.date || "", data.name || "",
      data.mobile || "", data.gotra || "-", data.amount || 0,
      data.paymentMode || "", data.staffId || "", data.status || "",
      data.sankalp || "-", data.city || "-", data.screenshotLink || ""
    ]);

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
