// readers over the `debug: true` report and over a transform's output, shared by the host suites
// that compare the two: the report is captured off `console.log`, the emitted set is read back off
// the code, so the oracle is the emission itself and not a list someone remembered
export function captureLogs(run) {
  const logs = [];
  const { log } = console;
  console.log = (...args) => logs.push(args.map(String).join(' '));
  try {
    return { result: run(), logs };
  } finally {
    console.log = log;
  }
}

export function isDebugReport(line) {
  return line.startsWith('core-js@4: `DEBUG` option\n');
}

// the polyfills a report lists, sorted; null without a report, and the report's own one-line
// verdict when it lists none (`did not add`, `has not been found`)
export function reportedPolyfills(logs) {
  const report = logs.find(isDebugReport);
  if (!report) return null;
  const lines = report.split('\n');
  const heading = lines.findIndex(line => line.startsWith('Using polyfills with `'));
  if (heading === -1) throw new Error('Missing polyfill report heading');
  const verdict = lines[heading + 1];
  if (!verdict.endsWith('the following polyfills:')) return verdict;
  const listed = [];
  for (const line of lines.slice(heading + 2)) {
    if (!line.startsWith('  ')) break;
    listed.push(line.trim().split(' ', 1)[0]);
  }
  return listed.sort();
}

// the polyfills an output imports, in the report's vocabulary: pure entries and side-effect modules
export function importedPolyfills(code) {
  return code.matchAll(/from "@core-js\/pure\/actual\/(?<entry>[^"]+)"|import "core-js\/modules\/(?<module>[^"]+)"|import 'core-js\/modules\/(?<quoted>[^']+)'/g)
    .map(match => match.groups.entry ?? match.groups.module ?? match.groups.quoted).toArray().sort();
}

export function reportCount(logs) {
  return logs.filter(isDebugReport).length;
}
