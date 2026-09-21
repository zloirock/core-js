import { lookupEntryModules } from './path-normalize.js';
import { brand } from './error-tag.js';

// a stateless copy of a RegExp: `g` and `y` write `lastIndex` on a hit, so a shared instance
// answers `test()` differently from call to call. `g` only adds that state and is dropped; `y` is
// ALSO an anchor - it matches at `lastIndex` alone, which for a fresh test is the start - so its
// meaning moves into the source (`^(?:...)`) while the flag goes, and the pattern keeps matching
// what its author wrote. sticky wins over global (`/a/gy` never matches past the start either), so
// any sticky pattern anchors. null / undefined / non-RegExp inputs surface as a more readable
// error than the opaque `Cannot read properties of null (reading 'global')` crash
export function toStatelessRegExp(re) {
  if (!(re instanceof RegExp)) throw new TypeError(brand('toStatelessRegExp: expected RegExp'));
  if (!re.global && !re.sticky) return re;
  return new RegExp(re.sticky ? `^(?:${ re.source })` : re.source, re.flags.replaceAll(/[gy]/g, ''));
}

// compile an include/exclude pattern (raw regex source string or RegExp) to a stateless
// RegExp anchored to start/end. Convention matches @babel/helper-define-polyfill-provider:
// the string is treated as raw regex syntax (no escaping, no glob shorthand)
// module names only contain `[a-z0-9.-]` so the only practically-relevant meta char is `.`, which works
// because `.` matches any char (including the literal `.` separator)
// returns null on parse failure so callers can decide how to handle malformed patterns.
// empty string rejected up front - `validatePatternList` already forbids `''`, so accepting
// a `/^$/` regex here would only matter on non-validated paths and would silently match
// the empty entry (never a real core-js module name).
// pattern is wrapped in `(?:...)` non-capturing group so user alternation (`a|b`) binds
// to the anchors uniformly: `^(?:a|b)$` matches whole `a` OR whole `b`. without the group,
// `^a|b$` parses as `(^a)|(b$)` and matches `axxx` (starts-with-a) OR `xxxb` (ends-with-b)
export function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return toStatelessRegExp(pattern);
  if (pattern === '') return null;
  try {
    return new RegExp(`^(?:${ pattern })$`);
  } catch {
    return null;
  }
}

// an include/exclude string names either an ENTRY PATH the entries map knows (`array/at`,
// `actual/promise`) or a raw regex over MODULE names, and the entries map is the one authority
// on which - the same lookup `collectEntryPaths` reads the entry through. a spelling test
// (`es.` prefix, a `*`) routed `es\\.array\\.from`, a documented raw regex, to the entry-path
// bucket and refused the build. a RegExp is always a module pattern
export function isEntryPattern(pattern) {
  return typeof pattern === 'string' && lookupEntryModules(pattern) !== null;
}

// the complement over the accepted pattern forms: a RegExp, or a string the entries map does not know
export function isModulePattern(pattern) {
  return pattern instanceof RegExp || (typeof pattern === 'string' && !isEntryPattern(pattern));
}

// the message of a thrown payload as a STRING, for interpolation into a diagnostic: `.message`
// when it is one, otherwise the payload's own string form. every read is guarded - an adversarial
// Proxy on the payload can make `.message` throw, a null-prototype object or a throwing `toString`
// makes `String(error)` throw, and a Symbol message would throw at the caller's interpolation -
// so the primary diagnostic always renders. consumed by the targets / user-callback catches
export function safeErrorMessage(error) {
  try {
    const { message } = Object(error);
    return typeof message === 'string' ? message : String(error);
  } catch {
    return '<unreadable>';
  }
}

// serialize a value for a diagnostic, shielding callers from `JSON.stringify` throws:
// circular references, BigInt, and adversarial Proxy traps (`getOwnPropertyDescriptor`,
// `ownKeys`) would all otherwise mask the primary type error being reported. fall back
// to `[Object]` on failure. shared across validation paths in `plugin-options` and here.
// edge values that JSON.stringify renders as `null` / drops (NaN, Infinity, Symbol, BigInt,
// function) get explicit native-toString to keep the diagnostic distinguishable
export function safeStringify(value) {
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'bigint') return `${ value }n`;
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  if (typeof value === 'function') {
    let name = '';
    try { name = typeof value.name === 'string' && value.name ? ` ${ value.name }` : ''; } catch { /* swallow */ }
    return `[Function${ name }]`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '[Object]';
  }
}

// validate include/exclude option lists: must be arrays of strings or RegExps (or absent).
// empty strings are rejected - `patternToRegExp('')` -> `/^$/` matches zero-length entry-paths
// and downstream produces a confusing "didn't match any polyfill" message
export function validatePatternList(name, list) {
  if (list === undefined || list === null) return;
  if (!Array.isArray(list)) {
    throw new TypeError(brand(`\`${ name }\` must be an array, or undefined (received ${ safeStringify(list) })`));
  }
  for (const [i, item] of list.entries()) {
    if (item === '') throw new TypeError(brand(`\`${ name }[${ i }]\` must be a non-empty string`));
    if (typeof item !== 'string' && !(item instanceof RegExp)) {
      throw new TypeError(brand(`\`${ name }[${ i }]\` must be a string or RegExp (received ${ safeStringify(item) })`));
    }
  }
}

// babel UID convention: `null` tries bare prefix first then `_hint2, _hint3, ...` (skip `_hint1`);
// finite non-negative number starts at `prefix${startSuffix}` and increments (cache continuation).
// non-negative < 2 clamps to 2 - preserves skip-1 invariant for continuations seeded with 0/1.
// undefined / non-number / non-finite / negative inputs reject loudly: a silent `_hintundefined`
// / `_hint-1` / `_hint[object Object]` would otherwise leak a caller bug downstream.
// iteration cap (2^20) bounds collision-storm pathologies; isTaken=true forever throws
export function findUniqueName(prefix, startSuffix, isTaken) {
  if (startSuffix === undefined) {
    throw new TypeError(brand('findUniqueName: startSuffix must be null (try-bare-first) '
      + 'or a finite non-negative number; got undefined'));
  }
  if (startSuffix !== null) {
    if (typeof startSuffix !== 'number' || !Number.isFinite(startSuffix)) {
      const got = typeof startSuffix === 'number' ? startSuffix : typeof startSuffix;
      throw new TypeError(brand(`findUniqueName: startSuffix must be null or a finite non-negative number; got ${ got }`));
    }
    if (startSuffix < 0) {
      throw new RangeError(brand(`findUniqueName: startSuffix must be non-negative; got ${ startSuffix }`));
    }
  }
  if (startSuffix === null) {
    if (!isTaken(prefix)) return prefix;
    startSuffix = 2;
  } else if (startSuffix < 2) startSuffix = 2;
  let counter = startSuffix;
  let name = `${ prefix }${ counter }`;
  const limit = counter + (1 << 20);
  while (isTaken(name)) {
    // report the last name actually tried (counter - 1): the pre-increment value is the taken
    // candidate that exhausted the space; the post-increment counter is the over-limit index
    // that was never constructed
    if (++counter > limit) throw new Error(brand(`findUniqueName: collision space exhausted at \`${ prefix }${ counter - 1 }\` (isTaken always returns true?)`));
    name = `${ prefix }${ counter }`;
  }
  return name;
}

// append `value` to the bucket `map[key]` of a Map<K, V[]>, creating the bucket on first insert
export function pushMultimap(map, key, value) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}
