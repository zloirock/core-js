// @ts-check
'use strict';

// Declare GAS globals for @ts-check
/** @type {GoogleAppsScript.Spreadsheet.SpreadsheetApp} */
const SpreadsheetApp = globalThis.SpreadsheetApp;
/** @type {GoogleAppsScript.Base.Logger} */
const Logger = globalThis.Logger;
/** @type {GoogleAppsScript.Utilities.Utilities} */
const Utilities = globalThis.Utilities;
/** @type {GoogleAppsScript.URL_Fetch.UrlFetchApp} */
const UrlFetchApp = globalThis.UrlFetchApp;

/** @typedef {{name: string, status: 'passed'|'failed', error?: string | null}} TestResultDetail */
/** @typedef {{passed: number, failed: number, skipped: number, details: TestResultDetail[]}} TestResultsSummary */

/**
 * @OnlyCurrentDoc
 * This script runs core-js compatibility tests within Google Apps Script
 * and logs the results to the spreadsheet it is bound to.
 */

// ==============================================================================
// == INSTRUCTIONS ==
// ==============================================================================
// 1. SAVE SCRIPT: Paste this entire code into the Apps Script editor attached
//    to a Google Sheet (Tools > Script editor). Save the script (e.g., name
//    it Code.gs).
// 2. RUN:
//    - Select "main_runCoreJsTests" from the function dropdown menu above the code.
//    - Click "Run".
//    - Authorize the script when prompted (review permissions carefully).
// 3. VIEW RESULTS:
//    - The script will run, fetching a specific version of the core-js test file
//      and validating its hash.
//    - A new sheet with the current timestamp will be created containing the
//      test results (this may take a minute or two).
//    - Passed tests (1) will have a green background, failed tests (0) red,
//      and other rows gray.
// 4. (Optional) TESTING A DIFFERENT CORE-JS VERSION:
//    - Find the Git commit hash for the specific `tests/compat/tests.js` version
//      you want to test in the `zloirock/core-js` repository.
//    - Use `curl` and `shasum -a 256` (or similar tools) to get the SHA-256 hash
//      of the *original* file content at that specific commit URL
//      (`https://raw.githubusercontent.com/zloirock/core-js/COMMIT_HASH/tests/compat/tests.js`).
//    - Update the `commitHash` and `expectedHash` properties within the
//      `TEST_FILE_CONFIG` object below with the new values.
//    - Run `main_runCoreJsTests` again.
// ==============================================================================

/**
 * Main entry point function. Select this function in the GAS IDE Run menu.
 */
function main_runCoreJsTests() {
  runCoreJsTests();
}

/**
 * Generates a valid Google Sheet name based on the current timestamp.
 * Example: "2024-07-28 15:30:05"
 * @returns {string} A timestamp string suitable for a sheet name.
 */
function createTimestampedSheetName() {
  const now = new Date();
  // Format as YYYY-MM-DD HH:mm:ss. Pad month, day, hour, minute, second with leading zeros if needed.
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // months are 0-indexed
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// --- Configuration ---
// Configuration object for the remotely fetched test file.
// To update:
// 1. Find the desired commit hash for tests/compat/tests.js in the core-js repo.
// 2. Update commitHash and commitDate below.
// 3. Get the SHA-256 hash of the *original* file content at that commit.
// 4. Update expectedHash below.
const TEST_FILE_CONFIG = {
  // Commit hash in the core-js repo for the version of tests.js to use
  commitHash: '05f0df1efb10d9b2a2f5cb57ca555863492cf4ef',

  // Commit date (for reference only)
  commitDate: '2025-04-07T15:42:14+03:00',

  // Expected SHA-256 hash of the ORIGINAL content fetched from the commit specified above.
  // This ensures the script fetched hasn't been unexpectedly altered.
  expectedHash: 'b86808c6388f3458daf83ff1cab4c5c3e561d9f4f7dcd40751fa1fd9cca3baaf'

  // Note: The full URL is constructed dynamically in loadTestDefinitions using the commitHash.
};
// --- End Configuration ---

/**
 * Main function to run the core-js tests in GAS and report results.
 * Called by main_runCoreJsTests.
 */
function runCoreJsTests() {
  let sheet;
  try {
    // Get the active spreadsheet and create a new sheet for this run at the beginning
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = createTimestampedSheetName();
    // Insert sheet at index 1 (leftmost position)
    sheet = ss.insertSheet(sheetName, 1);

    // Activate the new sheet (optional, but good practice after inserting at specific index)
    sheet.activate();

    // Add header row (Timestamp removed, Status -> Pass/Fail)
    sheet.appendRow(['Message/Test', 'Pass/Fail', 'Details']);
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush(); // Ensure sheet is created before proceeding

    logToSheet(sheet, 'Starting core-js tests...');

    // 1. Load the test definitions
    loadTestDefinitions();

    // 2. Execute the tests defined in GLOBAL.tests
    const results = executeTests();

    // 3. Format and write results to Google Sheet
    logResultsToSheet(sheet, results);

    logToSheet(sheet, 'Tests finished successfully.');

    // Set Column A format to Plain Text
    try {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            Logger.log('Setting column A (Message/Test) format to Plain Text...');
            sheet.getRange(2, 1, lastRow - 1, 1).setNumberFormat('@');

            // Auto-resize column A
            Logger.log('Auto-resizing column A (Message/Test)...');
            sheet.autoResizeColumn(1); // Resize only column 1 (A)
        }
    } catch (textFormatOrResizeError) {
        // Log combined error for format or resize
        Logger.log('Error setting column A format or resizing column A: ' + textFormatOrResizeError.message);
    }

    // Apply conditional formatting
    try {
      Logger.log('Applying conditional formatting...');
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const dataRange = sheet.getRange(2, 1, lastRow - 1, 3);
        // Start with an empty array for the new rules
        const newRules = [];

        // Rule 1: Default background (Light Gray) - Applied first
        // Using a formula that is always true for the range is a way to apply default background
        const grayRule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied("=TRUE") // Apply to all cells in the range
          .setBackground("#F3F3F3") // Light gray
          .setRanges([dataRange])
          .build();
        newRules.push(grayRule); // Add gray rule first

        // Rule 2: Failures (0 in column B, not blank) -> Light Red
        const failRule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied("=AND(NOT(ISBLANK($B2)), $B2=0)")
          .setBackground("#F8CECC")
          .setRanges([dataRange])
          .build();
        newRules.push(failRule); // Add red rule second

        // Rule 3: Passes (1 in column B) -> Light Green
        const passRule = SpreadsheetApp.newConditionalFormatRule()
          .whenFormulaSatisfied("=$B2=1")
          .setBackground("#D8EAD3")
          .setRanges([dataRange])
          .build();
        newRules.push(passRule); // Add green rule third

        // Set the rules in the determined order
        sheet.setConditionalFormatRules(newRules);
        Logger.log('Conditional formatting rules (Gray/Red/Green) applied.');
      }
    } catch (formatError) {
        Logger.log('Error applying conditional formatting: ' + formatError.message + '\n' + formatError.stack);
        // Continue without formatting if it fails
    }

    // Ensure all writes are persisted
    SpreadsheetApp.flush();

  } catch (error) {
    Logger.log('Error running tests: ' + error.message + '\n' + error.stack);
    // Log error to the sheet if it was created, otherwise just log
    if (sheet) {
      logToSheet(sheet, 'ERROR: ' + error.message);
    } else {
      // Attempt to log to a default sheet or just use Logger if sheet creation failed
      try {
          const fallbackSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Log to currently active sheet
          const timestamp = new Date();
          fallbackSheet.appendRow([timestamp, 'RUNNER_ERROR', error.message]);
      } catch(e) {
           Logger.log('Failed to log RUNNER_ERROR to fallback sheet: ' + e.message)
      }
    }
  }
}

/**
 * Fetches, validates, modifies, and evaluates tests.js based on TEST_FILE_CONFIG.
 */
function loadTestDefinitions() {
  // Construct the URL dynamically from the configured commit hash
  const testFileURL = `https://raw.githubusercontent.com/zloirock/core-js/${TEST_FILE_CONFIG.commitHash}/tests/compat/tests.js`;
  Logger.log('Attempting to fetch tests.js from: ' + testFileURL);

  let response = null;
  let responseCode = -1;
  let content = '';
  let fetchError = null;
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
        Logger.log(`Fetch attempt ${attempt}/${MAX_ATTEMPTS}...`);
        response = UrlFetchApp.fetch(testFileURL, { muteHttpExceptions: true });
        responseCode = response.getResponseCode();

        if (responseCode === 200) {
            Logger.log(`Fetch successful on attempt ${attempt}.`);
            content = response.getContentText(); // Get content on success
            fetchError = null; // Clear last error
            break; // Exit loop on success
        } else if (responseCode === 404) {
            fetchError = new Error(`Server returned 404 Not Found on attempt ${attempt}. URL may be incorrect.`);
            Logger.log(fetchError.message + ' Aborting retries.');
            break; // Don't retry 404
        } else {
            // Other non-200 response
            fetchError = new Error(`Fetch attempt ${attempt} failed with status code: ${responseCode}`);
            Logger.log(fetchError.message);
        }
    } catch (networkError) {
        fetchError = networkError; // Store the network error
        Logger.log(`Network error on fetch attempt ${attempt}: ${fetchError.message}`);
    }

    // If not successful and not the last attempt, wait before retrying
    if (responseCode !== 200 && attempt < MAX_ATTEMPTS && responseCode !== 404) {
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, attempt - 1) * 1000;
        Logger.log(`Waiting ${delay / 1000}s before retry...`);
        Utilities.sleep(delay);
    }
  }

  // After the loop, check if fetch was ultimately successful
  if (responseCode !== 200) {
    const finalErrorMsg = fetchError ? fetchError.message : `Failed to fetch after ${MAX_ATTEMPTS} attempts with last code ${responseCode}.`;
    Logger.log(`ERROR: Fetch failed definitively. ${finalErrorMsg}`);
    // Throw the most relevant error message
    throw new Error(`Failed to fetch tests.js: ${finalErrorMsg}`);
  }

  // --- If fetch succeeded, proceed with validation, modification, eval ---
  let modifiedContent;
  try {
    // Log details about the fetched content
    const headers = response.getHeaders();
    const mimeType = headers['Content-Type'] || headers['content-type'] || 'N/A'; // Handle case variations
    Logger.log(`Fetched content size: ${content.length} characters`);
    Logger.log(`Fetched content MIME type: ${mimeType}`);

    const lines = content.split('\n');
    const lineCount = lines.length;
    Logger.log(`Fetched content line count: ${lineCount}`);

    if (lineCount > 0) {
        Logger.log('--- First 5 lines ---');
        for(let i = 0; i < Math.min(5, lineCount); i++) {
            Logger.log(`[${i+1}] ${lines[i]}`)
        }
        Logger.log('---------------------');
    }

    if (lineCount > 5) { // Only show last lines if there are more than 5 total
        Logger.log('--- Last 5 lines ----');
        const startLine = Math.max(0, lineCount - 5);
        for(let i = startLine; i < lineCount; i++) {
             Logger.log(`[${i+1}] ${lines[i]}`)
        }
        Logger.log('---------------------');
    }

    // 1. Compute and Validate Hash of ORIGINAL Content
    Logger.log('Computing hash of ORIGINAL content...');
    // Note: Assuming UTF-8 encoding for the hash calculation.
    // raw.githubusercontent.com serves raw bytes from Git. While GitHub typically sends
    // text/plain; charset=utf-8 for .js files without invalid UTF-8 sequences, the core assumption
    // here is that core-js stores its .js files as UTF-8 in Git. Parsing the actual charset
    // header adds complexity for a very low probability of mismatch for this specific source file.
    const computedHashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, content, Utilities.Charset.UTF_8);
    let computedHashHex = '';
    for (let i = 0; i < computedHashBytes.length; i++) {
      let byte = computedHashBytes[i];
      if (byte < 0) byte += 256;
      const byteHex = byte.toString(16);
      computedHashHex += (byteHex.length === 1 ? '0' : '') + byteHex;
    }
    Logger.log('Computed Hash (original content): ' + computedHashHex);

    // --- Validation Check (Recommended) ---
    // Ensure this expectedHash matches the computed hash above!
    if (computedHashHex !== TEST_FILE_CONFIG.expectedHash) {
        Logger.log('ERROR: ORIGINAL Content hash mismatch! Expected: ' + TEST_FILE_CONFIG.expectedHash + ' for commit ' + TEST_FILE_CONFIG.commitHash);
        throw new Error('Fetched tests.js content does not match expected hash for commit ' + TEST_FILE_CONFIG.commitHash + '. Aborting evaluation.');
    }
    Logger.log('ORIGINAL Content hash verified.');
    // --- End Validation Check ---

    // 2. Modify fetched content AFTER validation
    Logger.log('Modifying content to target GAS global scope...');
    const originalGlobalDef = "var GLOBAL = typeof global != 'undefined' ? global : Function('return this')();";
    const forcedGlobalDef = "var GLOBAL = globalThis; // Forced to GAS global scope by gas-runner.gs using globalThis";
    modifiedContent = content; // Start with original
    if (content.includes(originalGlobalDef)) {
        modifiedContent = content.replace(originalGlobalDef, forcedGlobalDef);
        Logger.log('Replaced GLOBAL definition in fetched code (using globalThis).');
    } else {
        Logger.log('Warning: Could not find the expected GLOBAL variable definition line in tests.js to replace it. Using original content for eval.');
        // Keep modifiedContent = content in this case
    }

    // 3. Evaluate the MODIFIED fetched code safely using an IIFE
    Logger.log('Evaluating MODIFIED fetched code via IIFE...');
    let evaluatedTests = null;
    const iifeWrapper = `(function() {\n${modifiedContent}\n; return GLOBAL.tests; })()`;
    try {
         evaluatedTests = eval(iifeWrapper);
    } catch (e) {
         if (e instanceof SyntaxError) {
             Logger.log('SyntaxError evaluating tests.js: ' + e.message + '\n' + e.stack);
             throw new Error('SyntaxError evaluating tests.js: ' + e.message);
         } else {
             // Re-throw other runtime errors during eval, including potential ReferenceErrors
             Logger.log('Runtime error during eval of tests.js: ' + e.message + '\n' + e.stack);
             throw e; // Re-throw the original error
         }
    }
    Logger.log('MODIFIED tests.js IIFE evaluation attempted.');

    // Verify the captured result
    if (typeof evaluatedTests !== 'object' || evaluatedTests === null) {
        Logger.log('Error: Evaluating the IIFE did not return a valid tests object. Type: ' + typeof evaluatedTests);
        throw new Error('Evaluating tests.js IIFE did not return an object.');
    }

    // Assign the captured tests object to the GAS global scope using globalThis
    globalThis.gasRunner_Tests = evaluatedTests; // Use globalThis for assignment
    Logger.log('Assigned evaluated tests to globalThis.gasRunner_Tests');

  } catch (e) {
    Logger.log('Error during post-fetch processing (validation, modification, eval): ' + e.message + '\n' + e.stack);
    // Re-throw post-fetch processing errors
    const finalMessage = e.message.startsWith('SyntaxError evaluating') || e.message.includes('GLOBAL.tests was not defined') || e.message.includes('GLOBAL.tests is not an object') || e.message.includes('does not match expected hash')
       ? e.message
       : 'Failed during post-fetch processing: ' + e.message;
    throw new Error(finalMessage);
  }
}

/**
 * Executes the tests object assigned to globalThis.gasRunner_Tests.
 * Iterates through the tests object, runs each test function, and collects results.
 * @returns {TestResultsSummary} An object representing the test results (passed, failed, details).
 */
function executeTests() {
  Logger.log('Executing tests from globalThis.gasRunner_Tests...');
  /** @type {TestResultsSummary} */
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    details: [] // Initialize as an empty array, type checked via results object type
  };

  // Check the explicitly assigned global variable using globalThis
  if (typeof globalThis.gasRunner_Tests === 'undefined' || typeof globalThis.gasRunner_Tests !== 'object' || globalThis.gasRunner_Tests === null) {
    Logger.log('ERROR: globalThis.gasRunner_Tests is not valid. Cannot execute tests. Was loadTestDefinitions successful?');
    results.details.push({ name: 'Setup Error', status: 'failed', error: 'globalThis.gasRunner_Tests not defined or not an object' });
    results.failed = 1;
    return results;
  }

  const testsToRun = globalThis.gasRunner_Tests; // Use the assigned global variable via globalThis
  const testNames = Object.keys(testsToRun);
  const numTests = testNames.length;
  Logger.log('Found ' + numTests + ' tests to execute.');

  // Warn if potentially too many tests for GAS limits
  if (numTests > 5000) { // Arbitrary threshold
      Logger.log('Warning: Large number of tests detected (' + numTests + '). Execution might hit GAS time limits.');
  }

  for (const testName of testNames) {
    // Removed redundant hasOwnProperty check since Object.keys was used
    const test = testsToRun[testName];
    let testPassed = false;
    let errorMessage = null;

    Logger.log('Starting test: ' + testName + '...'); // Log start

    try {
      if (typeof test === 'function') {
        testPassed = !!test(); // Coerce result to boolean
      } else if (Array.isArray(test)) {
        // If it's an array, all functions must pass
        testPassed = test.every(function (subTest, index) {
            if (typeof subTest !== 'function') {
                throw new Error(`Test array element at index ${index} is not a function for: ${testName}`);
            }
            return !!subTest(); // Ensure boolean result
        });
      } else {
          throw new Error(`Test entry is not a function or array for: ${testName} (Type: ${typeof test})`);
      }
    } catch (error) {
      testPassed = false;
      errorMessage = error.message ? error.message : String(error);
      // Avoid logging overly long stack traces if not useful
      Logger.log(`Error during test ${testName}: ${errorMessage}` + (error.stack ? '\nStack: ' + error.stack.substring(0, 1000) : ''));
    }

    if (testPassed) {
      results.passed++;
      results.details.push({ name: testName, status: 'passed' });
    } else {
      results.failed++;
      results.details.push({ name: testName, status: 'failed', error: errorMessage });
    }
  }

  Logger.log(`Test execution finished: Passed: ${results.passed}, Failed: ${results.failed}`);
  return results;
}

/**
 * Appends a log message to the target Google Sheet.
 * @param {object} sheet The sheet object to write to. (Using object type for @ts-check compatibility)
 * @param {string} message The message to log.
 */
function logToSheet(sheet, message) {
  try {
    // Ensure message is a string
    const messageStr = (message === null || message === undefined) ? String(message) : message;
    // Write only to first column, no quote needed now
    sheet.appendRow([messageStr]);
  } catch (e) {
    // Log error with more context
    Logger.log('Error in logToSheet: Failed to append row. Message: ' + message + '. Error: ' + e.message);
  }
}

/**
 * Formats and logs detailed test results to the sheet using batching.
 * Pass/Fail is 0/1/blank.
 * @param {object} sheet The sheet object to write to. (Using object type for @ts-check compatibility)
 * @param {TestResultsSummary} results The test results object from executeTests.
 */
function logResultsToSheet(sheet, results) {
  try {
    // Add a summary row
    const summaryMsg = `Summary: Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`;
    sheet.appendRow([summaryMsg]); // Only in first column

    // Add details if available
    if (results.details && results.details.length > 0) {
       sheet.appendRow(["--- Test Details ---"]); // Only in first column

       // Prepare data for batch write
       const dataToWrite = results.details.map(test => {
         let errorStr = ''; // Default to empty string
         if (test.error !== null && test.error !== undefined) {
           errorStr = String(test.error);
           if (errorStr.length > 500) {
             errorStr = errorStr.substring(0, 497) + '...';
           }
         }
         // Format status: passed -> 1, failed -> 0, otherwise empty
         const passFailStatus = test.status === 'passed' ? 1 : (test.status === 'failed' ? 0 : '');
         // No quote needed for test name now
         return [test.name, passFailStatus, errorStr];
       });

       // Get the range to write to (starts after the '--- Test Details ---' row)
       const startRow = sheet.getLastRow() + 1;
       const numRows = dataToWrite.length;
       const numCols = 3; // Message/Test, Pass/Fail, Details

       if (numRows > 0) {
         const targetRange = sheet.getRange(startRow, 1, numRows, numCols);
         targetRange.setValues(dataToWrite);
         Logger.log(`Wrote ${numRows} test details in a single batch.`);
       }

       sheet.appendRow(["--- End Details ---"]); // Only in first column
    }

  } catch (e) {
    Logger.log('Error in logResultsToSheet: Failed to log results. Error: ' + e.message);
  }
}

// --- Utility ---
// Add any other necessary utility functions here.
