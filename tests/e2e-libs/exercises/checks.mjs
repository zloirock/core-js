// The comparison every exercise shares, and the shape they all report. Bundled and transpiled with
// them, so what it reaches for is injected and snapshotted like anything else in the graph.

// `toJSON` first, once, the way `JSON.stringify` does it: for a Date that method IS the value, and
// walking own properties instead finds none, so every date would equal every other one and `{}`.
//
// It costs a check its teeth, which is the half worth knowing when writing one: a Date compares EQUAL
// to the ISO string it renders, so an assertion that a library formatted a date into that string is
// also satisfied by one that handed the Date straight back. Where the point of the check is that a
// value was rendered, assert its `typeof` alongside it.
function unwrap(value) {
  return typeof value?.toJSON === 'function' ? value.toJSON() : value;
}

// NaN equals NaN here: both sides come from the same computation, so a sentinel matching its
// expectation is the useful answer. What must not hold is `NaN` equalling `null` - JSON renders both
// as `null`, and a comparison built on that text would call them the same value.
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
    // Key ORDER does not decide, which a stringify comparison could not help but let it do: a library
    // that assembles the same fields in another order is not a library that returns something else.
    // Counting both ways is what makes a key present on one side only a difference.
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
      // A label is the check's identity - it is what a red cell prints, what the browser leg compares
      // against the pre-flight, and all a reader gets. Two checks sharing one leave a failure naming
      // something that appears twice, and a `pushResult` line that could belong to either.
      if (labels.has(label)) throw new Error(`duplicate check label '${ label }' - a label names one check`);
      labels.add(label);
      checks.push({ label, actual, expected, pass: deepEqual(actual, expected) });
    },
  };
}
