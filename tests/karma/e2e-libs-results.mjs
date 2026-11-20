export function browserOutcome(report, frames) {
  if (report.errors.length) {
    throw new Error(`the browser leg's page itself failed - ${ report.errors.map(({ browser, error }) => `${ browser }: ${ error }`).join('; ') }`);
  }
  const browsers = new Set(report.browsers);
  if (!browsers.size || browsers.size !== report.browsers.length) throw new Error('missing or ambiguous Karma browser identities');

  const outcome = new Map(frames.map(({ label }) => [label, new Map()]));
  for (const { browser, label, success, skipped } of report.results) {
    if (!browsers.has(browser)) throw new Error(`unexpected browser ${ browser }`);
    const perBrowser = outcome.get(label);
    if (!perBrowser) throw new Error(`${ browser } reported on '${ label }', which no frame of this run is`);
    if (perBrowser.has(browser)) throw new Error(`${ browser } reported on '${ label }' twice`);
    if (skipped || typeof success !== 'boolean') throw new Error(`${ browser } skipped or omitted the verdict for '${ label }'`);
    perBrowser.set(browser, success);
  }
  for (const [label, outcomes] of outcome) {
    for (const browser of browsers) {
      if (!outcomes.has(browser)) throw new Error(`${ browser } did not report on '${ label }'`);
    }
  }
  return outcome;
}
