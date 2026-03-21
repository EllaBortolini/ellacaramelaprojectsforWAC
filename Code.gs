/**
 * WAC Task Request — Google Apps Script
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO SET UP (one-time, ~10 minutes):
 *
 * STEP 1 — Create your Google Form
 *   1. Go to forms.google.com → New form
 *   2. Set title: "Submit a Request to Ella — WAC Systems"
 *   3. Add these questions exactly (question text must match FIELD_MAP below):
 *       - "Your Name"            → Short answer  (Required)
 *       - "Your Role"            → Short answer
 *       - "Request Title"        → Short answer  (Required)
 *       - "Description"          → Paragraph     (Required)
 *       - "Category"             → Dropdown      (Required)
 *           Options: Automations, AI Systems, Revenue Systems,
 *                    Clinical Tools, Infrastructure, Reactivation, Other
 *       - "Priority"             → Multiple choice
 *           Options: High, Medium, Low
 *       - "Requested Deadline"   → Date
 *   4. Click the Google Sheets icon (Responses tab → Link to Sheets)
 *      → Create a new spreadsheet. Note the spreadsheet name.
 *
 * STEP 2 — Add this script
 *   1. In the Google Sheet: Extensions → Apps Script
 *   2. Delete the placeholder code, paste this entire file
 *   3. Update WEBHOOK_URL below with your Netlify function URL
 *      (see STEP 4 for how to get that URL)
 *   4. Save (Ctrl+S / Cmd+S)
 *
 * STEP 3 — Set the trigger
 *   1. In Apps Script: click the clock icon (Triggers) on the left sidebar
 *   2. Click "+ Add Trigger" (bottom right)
 *   3. Configure:
 *       - Function: onFormSubmit
 *       - Event source: From spreadsheet
 *       - Event type: On form submit
 *   4. Click Save → authorize when prompted (use your Google account)
 *
 * STEP 4 — Set up the Netlify function (receives POST from this script)
 *   1. In your ellacaramelaprojectsforWAC repo, create:
 *      netlify/functions/requests.js   ← see requests.js file provided
 *   2. Deploy to Netlify (push to main)
 *   3. Your function URL will be:
 *      https://projectsforella.vercel.app/.netlify/functions/requests
 *      (Note: since you're on Vercel, use the Vercel serverless equivalent)
 *      OR use a free service like https://pipedream.com to receive the webhook
 *      and forward to your hub's localStorage via the hub's /api/requests endpoint
 *
 * STEP 5 — Test
 *   1. Submit a test response via your Google Form
 *   2. Check Apps Script → Executions to confirm it ran without error
 *   3. Check your hub's Requests tab — the submission should appear
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── CONFIG — update this ──────────────────────────────────────────────────────
const WEBHOOK_URL = "https://YOUR_NETLIFY_OR_VERCEL_FUNCTION_URL/api/requests";
// e.g. "https://projectsforella.vercel.app/api/requests"

// Maps Google Form question titles → payload field names
// If you rename a question in your form, update the left side here.
const FIELD_MAP = {
  "Your Name":           "submittedBy",
  "Your Role":           "role",
  "Request Title":       "title",
  "Description":         "description",
  "Category":            "category",
  "Priority":            "priority",
  "Requested Deadline":  "deadline",
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Triggered automatically on every Google Form submission.
 * Reads response values, maps them to the hub payload shape,
 * and POSTs to the webhook URL.
 */
function onFormSubmit(e) {
  try {
    const responses = e.namedValues; // { "Question Title": ["Answer"], ... }

    // Build payload
    const payload = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
    };

    Object.entries(FIELD_MAP).forEach(([formLabel, payloadKey]) => {
      const val = responses[formLabel];
      payload[payloadKey] = val && val[0] ? val[0].trim() : "";
    });

    // Normalize priority to lowercase
    if (payload.priority) {
      payload.priority = payload.priority.toLowerCase();
    } else {
      payload.priority = "medium";
    }

    // Empty deadline → null
    if (!payload.deadline) payload.deadline = null;

    // Validate minimum required fields
    if (!payload.submittedBy || !payload.title || !payload.description) {
      Logger.log("Submission missing required fields — skipping webhook.");
      return;
    }

    // POST to hub webhook
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log("Webhook response: " + response.getResponseCode() + " " + response.getContentText());

  } catch (err) {
    Logger.log("Error in onFormSubmit: " + err.toString());
  }
}

/**
 * Manual test — run this from Apps Script editor to verify the webhook
 * without needing to submit a real form response.
 */
function testWebhook() {
  const testPayload = {
    id: Date.now(),
    submittedBy: "Test User",
    role: "CA",
    title: "Test Request from Apps Script",
    description: "This is a test submission to verify the webhook is working correctly.",
    category: "Infrastructure",
    priority: "low",
    deadline: null,
    submittedAt: new Date().toISOString(),
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(testPayload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log("Test response: " + response.getResponseCode());
    Logger.log(response.getContentText());
  } catch (err) {
    Logger.log("Test failed: " + err.toString());
  }
}
