// strip g/y flags from RegExp to prevent lastIndex state between calls
export function toStatelessRegExp(re) {
  return re.global || re.sticky ? new RegExp(re.source, re.flags.replaceAll(/[gy]/g, '')) : re;
}

// compile an include/exclude pattern (raw regex source string or RegExp) to a stateless
// RegExp anchored to start/end. Convention matches @babel/helper-define-polyfill-provider:
// the string is treated as raw regex syntax (no escaping, no glob shorthand)
// module names only contain `[a-z0-9.-]` so the only practically-relevant meta char is `.`, which works
// because `.` matches any char (including the literal `.` separator)
// returns null on parse failure so callers can decide how to handle malformed patterns.
// empty string rejected up front - `validatePatternList` already forbids `''`, so accepting
// a `/^$/` regex here would only matter on non-validated paths and would silently match
// the empty entry (never a real core-js module name)
export function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return toStatelessRegExp(pattern);
  if (pattern === '') return null;
  try {
    return new RegExp(`^${ pattern }$`);
  } catch {
    return null;
  }
}

// known namespace prefix or wildcard -> module-name pattern; everything else is an entry path
export function isModulePattern(pattern) {
  if (pattern instanceof RegExp) return true;
  if (typeof pattern !== 'string') return false;
  return pattern.startsWith('es.')
    || pattern.startsWith('esnext.')
    || pattern.startsWith('web.')
    || pattern.includes('*');
}

export function isEntryPattern(pattern) {
  return typeof pattern === 'string' && !isModulePattern(pattern);
}

// serialize a value for a diagnostic, shielding callers from `JSON.stringify` throws:
// circular references, BigInt, and adversarial Proxy traps (`getOwnPropertyDescriptor`,
// `ownKeys`) would all otherwise mask the primary type error being reported. fall back
// to `[Object]` on failure. shared across validation paths in `plugin-options` and here
export function safeStringify(value) {
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
    throw new TypeError(`\`${ name }\` must be an array, or undefined (received ${ safeStringify(list) })`);
  }
  for (const item of list) {
    if (item === '') throw new TypeError(`\`${ name }[*]\` must be a non-empty string`);
    if (typeof item !== 'string' && !(item instanceof RegExp)) {
      throw new TypeError(`\`${ name }[*]\` must be a string or RegExp (received ${ safeStringify(item) })`);
    }
  }
}

// generate a unique identifier name following babel's UID convention: `startSuffix === null`
// tries the bare prefix first, falling back to `_hint2, _hint3, ...` on collision (skip `_hint1`);
// numeric `startSuffix` starts at `prefix${startSuffix}` and increments (cache-driven continuation).
// isTaken is called for each candidate; true = name conflicts
export function findUniqueName(prefix, startSuffix, isTaken) {
  if (startSuffix === null) {
    if (!isTaken(prefix)) return prefix;
    startSuffix = 2;
  }
  let counter = startSuffix;
  let name = `${ prefix }${ counter }`;
  while (isTaken(name)) name = `${ prefix }${ ++counter }`;
  return name;
}
