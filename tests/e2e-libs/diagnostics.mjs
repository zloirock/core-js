// How this suite says what went wrong; the page programs answer the same in `harness/shared.js`.
// Formatters only, and NO zx global anywhere - `preflight-child.mjs` imports this under a bare `node`.

const REASON_MAX = 200; // a line or two; long enough for a named error and the message after it
// the POSITION is what makes a frame: without it a line opening `at least one ...` is dropped as one
const STACK_FRAME = /^at\s.*:\d+:\d+\)?$/;
const NAMED_ERROR = /^\w*(?:Error|Exception)\b/;
const ZX_FOOTER = /^(?:exit code|signal):/;

// One console-width line out of an unknown throwable. `stderr` first, and no stack frame from either:
// node prints the offending `file:line` before the error, and zx's frame names the `$` call.
export function errorReason(err) {
  // each source is tried for CONTENT: on truthiness a stderr of one newline wins and reduces the line
  // to `FAIL <label>: `, and `[object Object]` is a stringification rather than a reason
  for (const source of [err?.stderr, err?.message, err]) {
    let text;
    // this runs INSIDE the `catch` that reports a cell: a throw of its own takes the run down unprinted
    try {
      text = String(source ?? '');
    } catch { continue; }
    if (text === '[object Object]') continue;
    const lines = text.split('\n').map(line => line.trim()).filter(line => line && !STACK_FRAME.test(line));
    if (!lines.length) continue;
    const named = lines.find(line => NAMED_ERROR.test(line));
    if (named) return named.slice(0, REASON_MAX);
    // zx appends its footer to the child's own output, so it is reported BESIDE what the child said
    const footer = lines.filter(line => ZX_FOOTER.test(line));
    const said = lines.find(line => !ZX_FOOTER.test(line));
    return [said, ...footer].filter(Boolean).join(', ').slice(0, REASON_MAX);
  }
  return [err?.name, err?.exitCode === undefined ? null : `exit ${ err.exitCode }`].filter(Boolean).join(', ')
    || 'failed without a message';
}

// The values `JSON.stringify` drops or renders as `null`, as text: it renders `NaN` and `null` alike,
// which `deepEqual` keeps apart. `-0` stays out - `deepEqual` holds it equal to `0`.
export function jsonLossyAsText(key, value) {
  if (typeof value === 'number' && !isFinite(value)) return String(value);
  if (value === undefined || typeof value === 'symbol') return String(value);
  return typeof value === 'function' ? `[function ${ value.name || 'anonymous' }]` : value;
}

// A circular structure is LEGAL here - `actual` is whatever the library handed back - so one that
// cannot be rendered costs its own line. Raw is not the fallback: `[object Object]` reads as a match.
export function renderValue(value) {
  // unquoted at the top: a replacer can only hand `JSON.stringify` a string, which it then quotes
  if (typeof value === 'number' && !isFinite(value)) return String(value);
  try {
    return JSON.stringify(value, jsonLossyAsText);
  } catch {
    return `<unrenderable ${ Object.prototype.toString.call(value) }>`;
  }
}

export function checkFailureLine(check) {
  return `${ check.label } actual=${ renderValue(check.actual) } expected=${ renderValue(check.expected) }`;
}
