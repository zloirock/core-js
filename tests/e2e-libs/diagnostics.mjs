// How this suite says what went wrong; the page programs answer the same in `harness/shared.js`.
// No zx globals: `preflight-child.mjs` imports this under a bare `node`.

import { inspect, isDeepStrictEqual } from 'node:util';

const REASON_MAX = 200; // a line or two; long enough for a named error and the message after it
const VALUE_MAX = 2048;
// the POSITION is what makes a frame: without it a line opening `at least one ...` is dropped as one
const STACK_FRAME = /^at\s.*:\d+:\d+\)?$/;
// The Node runners catch ordinary exceptions or an arbitrary value thrown by an exercise.
export function errorReason(err) {
  for (const property of ['message', null, 'name']) {
    try {
      const value = property === null ? err : err?.[property];
      const text = String(value ?? '');
      if (text === '[object Object]') continue;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line && !STACK_FRAME.test(line));
      if (lines.length) return lines.join(' ').slice(0, 2 * VALUE_MAX + REASON_MAX);
    } catch { /* Another property may still describe this exception. */ }
  }
  return 'failed without a message';
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

// Quote the differing region when the displayed values would hide it.
export function renderValues(first, second, path = '', seen = new Set()) {
  const values = [renderValue(first), renderValue(second)];
  if (values[0] === values[1] && first !== second && first && second
    && typeof first === 'object' && typeof second === 'object' && !seen.has(first)) {
    seen.add(first);
    // inspect may omit array tails or deeply nested properties. Follow data properties
    // only: formatting a difference should not need to invoke another accessor.
    try {
      for (const key of new Set([...Object.keys(first), ...Object.keys(second)])) {
        const left = Object.getOwnPropertyDescriptor(first, key);
        const right = Object.getOwnPropertyDescriptor(second, key);
        if ((left && !Object.hasOwn(left, 'value')) || (right && !Object.hasOwn(right, 'value'))) continue;
        if (left && right && isDeepStrictEqual(left.value, right.value)) continue;
        const slot = `${ path }[${ Array.isArray(first) ? key : renderValue(key) }]`;
        if (left && right) return renderValues(left.value, right.value, slot, seen);
        return [left, right].map(side => `at ${ slot } ${ side ? renderValue(side.value) : '<missing>' }`);
      }
    } catch { /* Opaque objects still have the original inspector output. */ }
  }
  return formatPair(first, second, path, values);
}

function formatPair(first, second, path, values) {
  const location = path ? `at ${ path } ` : '';
  if (typeof first !== 'string' || typeof second !== 'string' || first === second || values.every(text => !text.endsWith('...'))) {
    return values.map(value => location + value);
  }
  let offset = 0;
  while (first[offset] === second[offset]) offset++;
  const start = Math.max(0, offset - 24);
  return [first, second].map(value => `${ location }at offset ${ offset } ${ renderValue(value.slice(start, offset + 24)) }`);
}

export function renderDifference(difference) {
  const { missing, pair, path } = difference;
  if (missing) {
    return pair.map((value, index) => {
      const absent = missing === (index === 0 ? 'actual' : 'expected');
      return `at ${ path } ${ absent ? '<missing>' : renderValue(value) }`;
    });
  }
  // The comparator has already isolated the mismatch, including structural
  // differences. Formatting it must not start another graph comparison.
  return formatPair(pair[0], pair[1], path, pair.map(renderValue));
}

export function checkFailureLine(check) {
  // Use the values read by the comparison, including accessors and toJSON projections.
  const { difference } = check;
  const [actual, expected] = Array.isArray(difference?.pair)
    ? renderDifference(difference)
    : renderValues(check.actual, check.expected);
  return `${ check.label } actual=${ actual } expected=${ expected }`;
}

// Read exercise-owned accessors once. Validation and reporting must use the same values.
export function captureChecks(result) {
  const checks = result?.checks;
  if (!Array.isArray(checks)) return checks;
  const rows = [];
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index];
    rows.push(check && { label: check.label, pass: check.pass, actual: check.actual, expected: check.expected, difference: check.difference });
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
      const [wanted, actual] = index < checks.length ? renderValues(expected[index], label) : [renderValue(expected[index]), 'no check'];
      return `check #${ index + 1 } expected ${ wanted } from the raw exercise, got ${ actual }`;
    }
    if (typeof label !== 'string' || typeof check.pass !== 'boolean') {
      return `run() returned a malformed check at index ${ index }`;
    }
  }
  return null;
}
