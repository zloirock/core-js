// How this suite says what went wrong; the page programs answer the same in `harness/shared.js`.
// No zx globals: `preflight-child.mjs` imports this under a bare `node`.

import { inspect } from 'node:util';

const REASON_MAX = 200; // a line or two; long enough for a named error and the message after it
const VALUE_MAX = 2048;
// the POSITION is what makes a frame: without it a line opening `at least one ...` is dropped as one
const STACK_FRAME = /^at\s.*:\d+:\d+\)?$/;
const NAMED_ERROR = /^\w*(?:Error|Exception)\b/;
const ZX_FOOTER = /^(?:exit code|signal):/;

// One console-width line out of an unknown throwable. `stderr` first, and no stack frame from either:
// node prints the offending `file:line` before the error, and zx's frame names the `$` call.
export function errorReason(err) {
  // each source is tried for CONTENT: on truthiness a stderr of one newline wins and reduces the line
  // to `FAIL <label>: `, and `[object Object]` is a stringification rather than a reason
  for (const property of ['stderr', 'message', null]) {
    let text;
    // this runs INSIDE the `catch` that reports a cell: a throw of its own takes the run down unprinted
    try {
      const source = property === null ? err : err?.[property];
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
  const parts = [];
  for (const property of ['name', 'exitCode']) {
    try {
      const value = err?.[property];
      if (value !== undefined && value !== null && value !== '') parts.push(property === 'name' ? String(value) : `exit ${ value }`);
    } catch { /* Another property may still describe this exception. */ }
  }
  return parts.join(', ').slice(0, REASON_MAX) || 'failed without a message';
}

// Node's inspector distinguishes missing array slots, undefined, strings and non-JSON values.
export function renderValue(value) {
  try {
    const text = typeof value === 'string'
      ? JSON.stringify(value.slice(0, VALUE_MAX))
      : inspect(value, { customInspect: false, depth: 6, breakLength: Infinity });
    return text.length > VALUE_MAX ? `${ text.slice(0, VALUE_MAX - 3) }...` : text;
  } catch {
    return '<unrenderable>';
  }
}

// Quote the first differing region when either string is too long to print in full.
export function renderValues(first, second) {
  const values = [renderValue(first), renderValue(second)];
  if (typeof first !== 'string' || typeof second !== 'string' || first === second) return values;
  if (values.every(text => !text.endsWith('...'))) return values;
  let offset = 0;
  while (first[offset] === second[offset]) offset++;
  const start = Math.max(0, offset - 24);
  return [first, second].map(value => `at offset ${ offset } ${ renderValue(value.slice(start, offset + 24)) }`);
}

export function checkFailureLine(check) {
  const [actual, expected] = renderValues(check.actual, check.expected);
  return `${ check.label } actual=${ actual } expected=${ expected }`;
}

// Read exercise-owned accessors once. Validation and reporting must use the same values.
export function captureChecks(result) {
  const checks = result?.checks;
  if (!Array.isArray(checks)) return checks;
  const rows = [];
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index];
    rows.push(check && { label: check.label, pass: check.pass, actual: check.actual, expected: check.expected });
  }
  return rows;
}

// Only these rows cross IPC. A successful comparison may contain opaque or cyclic values.
export function checkRows(checks) {
  return checks.map(check => ({ label: check.label, pass: check.pass, failure: check.pass ? null : checkFailureLine(check) }));
}

export function checkResultProblem(checks, expected) {
  if (!Array.isArray(checks)) return 'run() did not return a checks array';
  const count = expected ? Math.max(checks.length, expected.length) : checks.length;
  for (let index = 0; index < count; index++) {
    const check = checks[index];
    const label = check?.label;
    if (expected && index >= expected.length) return `unexpected check ${ renderValue(label) } at #${ index + 1 }`;
    if (expected && label !== expected[index]) {
      const actual = index < checks.length ? renderValue(label) : 'no check';
      return `check #${ index + 1 } expected ${ renderValue(expected[index]) } from the raw exercise, got ${ actual }`;
    }
    if (typeof label !== 'string' || typeof check.pass !== 'boolean') {
      return `run() returned a malformed check at index ${ index }`;
    }
  }
  return null;
}
