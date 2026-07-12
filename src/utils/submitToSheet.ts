// ─── Google Sheets Submission ────────────────────────────────────────────────
//
//  This sends task data to a Google Sheet via a Google Apps Script Web App.
//
//  SETUP INSTRUCTIONS:
//  1. Open your Google Sheet:
//     https://docs.google.com/spreadsheets/d/1fGPjOQNWRi8W1tgxGmRWv-HtYkV8dRVK4gQWlMRgg-M
//  2. Go to Extensions → Apps Script
//  3. Delete any existing code and paste the script from the bottom of this file
//  4. Click Deploy → New deployment
//  5. Type: "Web app"
//  6. Execute as: "Me"
//  7. Who has access: "Anyone"
//  8. Click Deploy → copy the URL
//  9. Paste the URL below in APPS_SCRIPT_URL
//
// ─────────────────────────────────────────────────────────────────────────────

// *** PASTE YOUR DEPLOYED APPS SCRIPT URL HERE ***
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWWGqVOJsnN2eLIqjefxh8c1lWLQLao8S5_kunu6cYMZnY31U8-9fexmnV5yy-MCUd/exec';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskItem {
  taskId: string;
  answer: 'yes' | 'no' | '';
}

interface Task {
  id: number;
  taskName: string;
  startTime: string;
  endTime: string;
  items: TaskItem[];
}

// ─── Build rows matching the spreadsheet columns ─────────────────────────────
//
// Columns: Agent Name | Date | Project No | Task No | Job Title | Task ID |
//          Start Time | End Time | Time Spent | Answer
//

function calculateTimeSpent(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function formatTimeForSheet(time: string): string {
  // Convert "09:32" to "9:32" to match the existing sheet format
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${parseInt(h)}:${m}`;
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildSubmissionRows(
  agentName: string,
  tasks: Task[]
): string[][] {
  const date = getTodayDate();
  const rows: string[][] = [];

  tasks.forEach((task, taskIndex) => {
    const projectNo = taskIndex + 1;
    const timeSpent = calculateTimeSpent(task.startTime, task.endTime);
    const startFormatted = formatTimeForSheet(task.startTime);
    const endFormatted = formatTimeForSheet(task.endTime);

    task.items.forEach((item, itemIndex) => {
      const taskNo = itemIndex + 1;
      const answer = item.answer === 'yes' ? 'Yes' : item.answer === 'no' ? 'No' : '';

      rows.push([
        agentName,           // Agent Name
        date,                // Date
        String(projectNo),   // Project No
        String(taskNo),      // Task No
        task.taskName,       // Job Title
        item.taskId,         // Task ID
        startFormatted,      // Start Time
        endFormatted,        // End Time
        String(timeSpent),   // Time Spent (minutes)
        answer,              // Answer
      ]);
    });
  });

  return rows;
}

// ─── Submit to Google Sheets ─────────────────────────────────────────────────

export async function submitToGoogleSheet(
  agentName: string,
  tasks: Task[]
): Promise<{ success: boolean; message: string }> {
  const rows = buildSubmissionRows(agentName, tasks);

  if (rows.length === 0) {
    return { success: false, message: 'No data to submit.' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ rows }),
      redirect: 'follow',
    });

    if (!response.ok) {
      return { success: false, message: `Server error: ${response.status}` };
    }

    const result = await response.json();

    if (result.status === 'success' || result.success) {
      return { success: true, message: `${rows.length} rows submitted successfully!` };
    } else {
      return { success: false, message: result.message || 'Unknown error from server.' };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please try again.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//
//  GOOGLE APPS SCRIPT CODE
//  (paste this into Extensions → Apps Script on your Google Sheet)
//
//  function doPost(e) {
//    var lock = LockService.getScriptLock();
//    lock.waitLock(30000);
//
//    try {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      var payload = JSON.parse(e.postData.contents);
//      var rows = payload.rows;
//
//      if (!rows || !Array.isArray(rows) || rows.length === 0) {
//        return ContentService
//          .createTextOutput(JSON.stringify({ status: "error", message: "No rows provided" }))
//          .setMimeType(ContentService.MimeType.JSON);
//      }
//
//      rows.forEach(function(row) {
//        sheet.appendRow(row);
//      });
//
//      return ContentService
//        .createTextOutput(JSON.stringify({ status: "success", message: rows.length + " rows added" }))
//        .setMimeType(ContentService.MimeType.JSON);
//
//    } catch (error) {
//      return ContentService
//        .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
//        .setMimeType(ContentService.MimeType.JSON);
//
//    } finally {
//      lock.releaseLock();
//    }
//  }
//
//  function doGet() {
//    return ContentService
//      .createTextOutput(JSON.stringify({ status: "ok", message: "Web app is running" }))
//      .setMimeType(ContentService.MimeType.JSON);
//  }
//
// ─────────────────────────────────────────────────────────────────────────────