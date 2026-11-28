import { stripVTControlCharacters } from 'node:util';
import { isExpectedFailure } from './e2e-libs-diagnostics.mjs';

export function selectRunnableCells(cells, libFilter) {
  const runnable = cells.filter(cell => !cell.error && (libFilter === undefined || cell.lib === libFilter));
  if (!runnable.length) throw new Error(`no e2e-libs pages to run${ libFilter ? ` for '${ libFilter }'` : '' }`);
  return runnable;
}

export function hasUnexpectedBrowserFailure({ results, errors }) {
  // Karma emits browser_error for both script errors and disconnects (lib/browser.js).
  return errors.some(({ error }) => !error.startsWith('Disconnected '))
    || results.some(result => result.skipped || (result.success === false && !isExpectedFailure(result)));
}

// Karma's dots reporter prefixes each assertion line with a tab. If the process exits before
// the JSON checkpoint, accept only complete known diagnostics and account for every summary.
export function hasLoggedFailure(output) {
  const lines = stripVTControlCharacters(output).split(/\r?\n/u);
  const seen = new Map();
  let total = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes(' FAILED')) continue;
    const summary = /^(?<browser>.*): Executed \d+ of \d+ \((?<count>\d+) FAILED\)/u.exec(line);
    if (summary) {
      if (Number(summary.groups.count) !== seen.get(summary.groups.browser)?.size) return true;
      continue;
    }
    const tally = /^TOTAL: (?<count>\d+) FAILED/u.exec(line);
    if (tally) {
      if (Number(tally.groups.count) !== total) return true;
      continue;
    }
    const header = /^(?<browser>IE 11\.0 \([^)]+\)) {2}(?<label>\S+) FAILED$/u.exec(line);
    if (!header) return true;
    const { browser, label } = header.groups;
    const details = [];
    while (lines[i + 1]?.startsWith('\t')) details.push(lines[++i].slice(1));
    // A QUnit failure can carry stack frames after the assertion. A second assertion, a
    // truncated one or an unfamiliar suffix must never be classified by its first message.
    const end = details.indexOf('Actual: false');
    if (end === -1 || details.slice(end + 1).some(row => row && !/^\s+at /u.test(row))) return true;
    const assertion = `${ details.slice(0, end + 1).join('\n') }\n`;
    if (!isExpectedFailure({ browser, label, log: [assertion] })) return true;
    if (!seen.has(browser)) seen.set(browser, new Set());
    if (seen.get(browser).has(label)) return true;
    seen.get(browser).add(label);
    total++;
  }
  return false;
}

export function browserOutcome(report, frames) {
  if (report.errors.length) {
    throw new Error(`the browser leg's page itself failed - ${ report.errors.map(({ browser, error }) => `${ browser }: ${ error }`).join('; ') }`);
  }
  const browsers = new Set(report.browsers);
  if (!browsers.size || browsers.size !== report.browsers.length) throw new Error('missing or ambiguous Karma browser identities');

  const outcome = new Map(frames.map(({ label }) => [label, new Map()]));
  for (const result of report.results) {
    const { browser, label, success, skipped } = result;
    if (!browsers.has(browser)) throw new Error(`unexpected browser ${ browser }`);
    const perBrowser = outcome.get(label);
    if (!perBrowser) throw new Error(`${ browser } reported on '${ label }', which no frame of this run is`);
    if (perBrowser.has(browser)) throw new Error(`${ browser } reported on '${ label }' twice`);
    if (skipped || typeof success !== 'boolean') throw new Error(`${ browser } skipped or omitted the verdict for '${ label }'`);
    perBrowser.set(browser, success ? 'passed' : isExpectedFailure(result) ? 'diagnostic-failed' : 'failed');
  }
  for (const [label, outcomes] of outcome) {
    for (const browser of browsers) {
      if (!outcomes.has(browser)) throw new Error(`${ browser } did not report on '${ label }'`);
    }
  }
  return outcome;
}
