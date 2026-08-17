// How this suite says what went wrong. Four surfaces report a failure - the raw tier,
// the runtime tier, and the two harness targets on the page - and each of them used to answer the
// same two questions its own way, so which of them a failure happened to reach decided whether it
// named a reason at all.
//
// No dependencies: the raw tier is the fast one and may not pull in rollup, Babel and esbuild to print
// a line, and the page needs the ES5 twin below as TEXT rather than as a callable.

// Turn an unknown throwable into one console-width line. Child-process failures carry the real
// reason on stderr, not on `message` (which is just "Command failed: ..."), and node prints the
// offending `file:line` BEFORE the actual `TypeError: ...` - so prefer the first line that names an
// error and fall back to the first line at all.
const REASON_MAX = 200; // one terminal row; long enough for a stack's first frame
export function errorReason(err) {
  // each source is tried for CONTENT, not for truthiness: a child whose stderr is a lone newline
  // would otherwise win the `||` chain and reduce the whole line to `FAIL <label>: `. The default
  // `[object Object]` is skipped on the same ground - it is a stringification, not a reason
  for (const source of [err?.stderr, err?.message, err]) {
    const text = String(source ?? '');
    if (text === '[object Object]') continue;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    return (lines.find(l => /^\w*(?:Error|Exception)\b/.test(l)) ?? lines[0]).slice(0, REASON_MAX);
  }
  // nothing said anything - still name what failed rather than print an empty reason
  return [err?.name, err?.exitCode === undefined ? null : `exit ${ err.exitCode }`].filter(Boolean).join(', ')
    || 'failed without a message';
}

// A check's two sides, rendered. `JSON.stringify` throws on a circular structure, and a circular
// structure is a LEGAL value here - `actual` is whatever the library handed back, and a DOM node
// knows its parent - so a value that cannot be rendered may cost its own line and nothing more.
// Printing it raw is not the fallback: `[object Object]` for both sides would read as a match.
export function renderValue(value) {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return `<unrenderable ${ Object.prototype.toString.call(value) }>`;
  }
}

// The one line a failing check gets, on every surface that reports one. BOTH sides: `checker()` keeps
// them for exactly this, and a lone `actual` leaves the reader to find the expectation in the fixture
// - for a failure that, in this suite, often reproduces only on the CI windows runner.
export function checkFailureLine(check) {
  return `${ check.label } actual=${ renderValue(check.actual) } expected=${ renderValue(check.expected) }`;
}

// The same policy as `errorReason`, for the page, as ES5 TEXT rather than as a callable. Only the
// policy carries over: the page has no stderr and no line to trim to. `[object Object]` is skipped
// here too - a rejected promise in the browser leg carries whatever the library threw, and the
// stringification of an object is not a reason.
//
// It calls nothing the bundle under test can replace - `String`, `+` and property reads only. A
// harness computing its verdict with a polyfilled method would be measuring itself.
export const ES5_REASON_SOURCE = `
    function e2eReason(err) {
      if (err && err.message) return String(err.message);
      var text = String(err);
      if (text !== '[object Object]') return text;
      return err && err.name ? String(err.name) : 'failed without a message';
    }
`;
