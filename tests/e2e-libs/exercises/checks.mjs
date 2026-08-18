// The comparison every exercise shares. Bundled with them, so the sole-origin rule in AGENTS.md binds
// it too: `JSON.stringify` is a polyfill target here, which is why the comparison below is structural.
// Check a new call against `origins` before adding one.

// `toJSON` first, once, the way `JSON.stringify` does it: for a Date that method IS the value, and
// walking own properties instead finds none, so every date would equal every other one and `{}`.
//
// It costs a check its teeth, which is the half worth knowing when writing one: a Date compares EQUAL
// to the ISO string it renders, so an assertion that a library formatted a date into that string is
// also satisfied by one that handed the Date straight back. Where the point of the check is that a
// value was rendered, assert its `typeof` alongside it.
function unwrap(value) {
  return value && typeof value.toJSON === 'function' ? value.toJSON() : value;
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

// NaN equals NaN here, and the infinities equal themselves: both sides come from the same computation,
// so a sentinel matching its expectation is the useful answer. `NaN` equalling `null` must not hold -
// JSON renders both as `null`. `isFinite` is the global, not `Number.isFinite`: not a polyfill target.
function sameNumber(a, b) {
  if (isFinite(a) || isFinite(b)) return a === b;
  return a === Infinity ? b === Infinity : a === -Infinity ? b === -Infinity : b !== Infinity && b !== -Infinity;
}

export function deepEqual(rawA, rawB) {
  const a = unwrap(rawA);
  const b = unwrap(rawB);
  if (typeof a === 'number' && typeof b === 'number') return sameNumber(a, b);
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Key ORDER does not decide, which a stringify comparison could not help but let it do: a library
    // that assembles the same fields in another order is not a library that returns something else.
    // Counting both ways is what makes a key present on one side only a difference.
    let extra = 0;
    for (const key in a) if (has(a, key)) {
      if (!has(b, key) || !deepEqual(a[key], b[key])) return false;
      extra++;
    }
    for (const key in b) if (has(b, key)) extra--;
    return extra === 0;
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
