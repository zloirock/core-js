// The comparison every exercise shares, and the shape they all report. Bundled and transpiled with
// them, so what it reaches for is injected and snapshotted like anything else in the graph.

// `toJSON` first, once, the way `JSON.stringify` does it: for a Date that method IS the value, and
// walking own properties instead finds none, so every date would equal every other one and `{}`. The
// cost is that a value compares EQUAL to what its `toJSON` renders, so where the point of a check is
// that something WAS rendered, assert its `typeof` alongside it.
function unwrap(value) {
  return typeof value?.toJSON === 'function' ? value.toJSON() : value;
}

// NaN equals NaN here - both sides come from the same computation. What must not hold is `NaN`
// equalling `null`: JSON renders both as `null`, and a comparison built on that text conflates them.
function sameNumber(a, b) {
  return Number.isNaN(a) ? Number.isNaN(b) : a === b;
}

export function deepEqual(rawA, rawB) {
  const a = unwrap(rawA);
  const b = unwrap(rawB);
  if (typeof a === 'number' && typeof b === 'number') return sameNumber(a, b);
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length
      && a.every((item, index) => deepEqual(item, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // key ORDER does not decide, which a stringify comparison could not help but let it do; counting
    // both ways is what makes a key present on one side only a difference
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length
      && keys.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
  }
  return a === b;
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
