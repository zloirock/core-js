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

// the polyfills a report lists, sorted; null without a report, and the report's own one-line
// verdict when it lists none (`did not add`, `has not been found`)
export function reportedPolyfills(logs) {
  const report = logs.find(line => line.includes('DEBUG'));
  if (!report) return null;
  const lines = report.split('\n');
  const start = lines.findIndex(line => line.endsWith('the following polyfills:'));
  if (start === -1) return lines.find(line => line.startsWith('The entry point') || line.startsWith('Based on')) ?? [];
  const listed = [];
  for (const line of lines.slice(start + 1)) {
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
  return logs.filter(line => line.includes('DEBUG')).length;
}
