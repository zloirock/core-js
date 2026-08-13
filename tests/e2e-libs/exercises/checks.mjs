// The two lines every exercise needs, in one place: four copies of them would drift, and a check that
// compares differently in one fixture than in another is a fixture that means something else.
//
// This module is BUNDLED into every cell, so it is held to the same rule as an exercise: it may not
// call the standard library on a library's behalf. The line that matters is the SOLE-ORIGIN one - a
// specifier no library in the graph would have injected, which then describes this harness instead of
// the library, or worse hides the library ceasing to need it. Today this file is the sole origin of
// none: what it does inject (`es.array.push`, and the Symbol/iterator family every ES5 down-compile
// pulls in) each arrive from a dozen or more places inside the libraries themselves.
//
// That is why the comparison below is structural rather than `JSON.stringify(a) === JSON.stringify(b)`.
// `JSON.stringify` is a polyfill target at this floor, and while it was the comparison, `es.json.stringify`
// sat in the rxjs and htmlparser2 baselines with this file as its ONLY origin, and in the codemirror and
// three ones it stood over the library's own use of it - so that use could have stopped without a single
// snapshot moving. Check a new call here against `origins` before adding one.

// `toJSON` is asked for first, the way `JSON.stringify` asks: for a Date that method IS the value, and
// walking its own properties instead finds none - every date would equal every other one and `{}`.
// Applied exactly ONCE, as stringify applies it, so a `toJSON` returning another such object cannot
// send this into a loop.
function unwrap(value) {
  return value && typeof value.toJSON === 'function' ? value.toJSON() : value;
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

// NaN equals NaN and the infinities equal themselves - both sides of a check come from the same
// computation, so a sentinel matching its expectation is the useful answer. What must NOT hold is
// `NaN` equalling `null`, which the old stringify comparison could not tell apart because JSON
// renders both as `null`. The global `isFinite` covers all three cases at once and, unlike
// `Number.isNaN` or `Number.isFinite`, is not a polyfill target.
function sameNumber(a, b) {
  if (isFinite(a) || isFinite(b)) return a === b;
  return a === Infinity ? b === Infinity : a === -Infinity ? b === -Infinity : b !== Infinity && b !== -Infinity;
}

export function eq(rawA, rawB) {
  const a = unwrap(rawA);
  const b = unwrap(rawB);
  if (typeof a === 'number' && typeof b === 'number') return sameNumber(a, b);
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!eq(a[i], b[i])) return false;
    return true;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Key ORDER does not decide, which a stringify comparison could not help but let it do: a library
    // that assembles the same fields in another order is not a library that returns something else.
    // Counting both ways is what makes a key present on one side only a difference.
    let extra = 0;
    for (const key in a) if (has(a, key)) {
      if (!has(b, key) || !eq(a[key], b[key])) return false;
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
  return {
    checks,
    check(label, actual, expected) {
      checks.push({ label, actual, expected, pass: eq(actual, expected) });
    },
  };
}
