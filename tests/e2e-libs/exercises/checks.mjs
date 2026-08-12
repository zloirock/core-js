// The two lines every exercise needs, in one place: four copies of them would drift, and a check
// that compares differently in one fixture than in another is a fixture that means something else.
//
// This module is BUNDLED into every cell, so it is held to the same rule as an exercise: it may not
// call the standard library on a library's behalf. Nothing here reaches past ES3 - no `Number.isNaN`,
// no `Object.entries`, no spread - or the injection sets would carry this file's own vocabulary and
// the snapshots would stop describing the libraries.

// `JSON.stringify` renders NaN and both infinities as `null`, so a check expecting `null` would pass
// on a NaN - reachable wherever a library returns a sentinel position or a failed conversion. Map
// them to strings first, and the comparison keeps them apart.
//
// Key ORDER is deliberately left alone: normalizing it needs `Object.keys().sort()`, which is stdlib
// this file must not call. No check here compares objects built by two different paths.
function canonical(value) {
  // the global `isFinite` covers NaN and both infinities at once, and unlike `Number.isNaN` or
  // `Number.isFinite` it is not a polyfill target, so it adds nothing to this file's injection set.
  // Three literals rather than one built by concatenation, for the same reason: Babel lowers both a
  // template and a `+` on a string to `"".concat(...)`, a stdlib call this frame keeps out.
  if (typeof value === 'number') {
    if (isFinite(value)) return value;
    return value === Infinity ? '#Infinity' : value === -Infinity ? '#-Infinity' : '#NaN';
  }
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) out.push(canonical(value[i]));
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key in value) if (Object.prototype.hasOwnProperty.call(value, key)) out[key] = canonical(value[key]);
    return out;
  }
  return value;
}

export function eq(a, b) {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
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
