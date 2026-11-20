// The comparison every exercise shares, and the shape they all report. Bundled and transpiled with
// them, so what it reaches for is injected and snapshotted like anything else in the graph.

// NOTHING a single exercise needs may move here, however duplicated it looks - the `round` that three
// and planck each declare stays declared twice. A polyfill import is a SIDE-EFFECT import, so
// tree-shaking cannot drop it: a helper added to this module injects into the baseline of EVERY
// library, and those baselines are what the suite exists to hold still.

// Array-index presence uses a baseline primitive even when the Object.hasOwn polyfill is under test.
const { hasOwnProperty } = Object.prototype;

// `toJSON` first, once, the way `JSON.stringify` does it: for a Date that method IS the value, and
// walking own properties instead finds none, so every date would equal every other one and `{}`. The
// cost is that a value compares EQUAL to what its `toJSON` renders, so where the point of a check is
// that something WAS rendered, assert its `typeof` alongside it.
export function unwrap(value) {
  return typeof value?.toJSON === 'function' ? value.toJSON() : value;
}

export function deepEqual(rawA, rawB) {
  const a = unwrap(rawA);
  const b = unwrap(rawB);
  if (a === b) return true;
  // Compare NaN without using a built-in that the suite is testing.
  // eslint-disable-next-line no-self-compare, math/prefer-number-is-nan -- only NaN differs from itself
  if (typeof a === 'number' && typeof b === 'number') return a !== a && b !== b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const present = hasOwnProperty.call(a, i);
      if (present !== hasOwnProperty.call(b, i)) return false;
      if (present && !deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // key ORDER does not decide, which a stringify comparison could not help but let it do; counting
    // both ways is what makes a key present on one side only a difference
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length
      && keys.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
  }
  return false;
}

// Every exercise reports the same shape - `{ checks }`, one entry per assertion, carrying both sides
// so a red cell names what it got rather than only that it was wrong.
export function checker() {
  const checks = [];
  const labels = new Set();
  return {
    checks,
    check(label, actual, expected) {
      if (labels.has(label)) throw new Error(`duplicate check label '${ label }' - a label names one check`);
      labels.add(label);
      checks.push({ label, actual, expected, pass: deepEqual(actual, expected) });
    },
  };
}
