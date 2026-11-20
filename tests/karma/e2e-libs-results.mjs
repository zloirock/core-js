import { stripVTControlCharacters } from 'node:util';
import { isExpectedFailure } from './e2e-libs-diagnostics.mjs';

export function hasUnexpectedBrowserFailure({ results, errors }) {
  // Karma emits browser_error for both script errors and disconnects (lib/browser.js).
  return errors.some(({ error }) => !error.startsWith('Disconnected '))
    || results.some(result => result.skipped || (result.success === false && !isExpectedFailure(result)));
}

// A completed browser can have a summary even if Karma stopped before writing its JSON report.
// The IE11 summary alone cannot distinguish its known errors from new ones.
export function hasFailingModernBrowser(output) {
  return stripVTControlCharacters(output).split('\n').some(line => {
    return !line.startsWith('IE 11.0 (') && /^\S.*: Executed \d+ of \d+ \(\d+ FAILED\)/u.test(line);
  });
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
