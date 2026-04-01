// ──────────────────────────────────────────────────
// GOOGLE APPS SCRIPT — paste this into your Sheet's
// Extensions > Apps Script editor
// ──────────────────────────────────────────────────

// Config
const SHEET_NAME = 'Leads';
const NOTIFY_EMAIL = 'kevinktg@goodai.au';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Write to Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Name', 'Business', 'Phone', 'Email', 'Problem', 'Conversation']);
      sheet.getRange('1:1').setFontWeight('bold');
    }

    const timestamp = data.timestamp
      ? new Date(data.timestamp)
      : new Date();

    sheet.appendRow([
      timestamp,
      data.name,
      data.business,
      data.phone,
      data.email,
      data.problem,
      data.conversation,
    ]);

    // 2. Send email notification
    const subject = 'New lead: ' + data.name + (data.business ? ' — ' + data.business : '');

    const body = [
      'NEW LEAD FROM GOODAI.AU',
      '─────────────────────',
      '',
      'Name:     ' + data.name,
      'Business: ' + (data.business || '—'),
      'Phone:    ' + data.phone,
      'Email:    ' + (data.email || '—'),
      'Time:     ' + timestamp.toLocaleString('en-AU', { timeZone: 'Australia/Perth' }),
      '',
      'THEIR PROBLEM:',
      data.problem || '—',
      '',
      'CONVERSATION:',
      '─────────────────────',
      data.conversation || '(none)',
    ].join('\n');

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
