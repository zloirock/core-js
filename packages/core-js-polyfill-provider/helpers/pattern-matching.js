// strip g/y flags from RegExp to prevent lastIndex state between calls
export function toStatelessRegExp(re) {
  return re.global || re.sticky ? new RegExp(re.source, re.flags.replaceAll(/[gy]/g, '')) : re;
}

// compile an include/exclude pattern (raw regex source string or RegExp) to a stateless
// RegExp anchored to start/end. Convention matches @babel/helper-define-polyfill-provider:
// the string is treated as raw regex syntax (no escaping, no glob shorthand)
// module names only contain `[a-z0-9.-]` so the only practically-relevant meta char is `.`, which works
// because `.` matches any char (including the literal `.` separator)
// returns null on parse failure so callers can decide how to handle malformed patterns
export function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return toStatelessRegExp(pattern);
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

// validate include/exclude option lists: must be arrays of strings or RegExps (or absent)
export function validatePatternList(name, list) {
  if (list === undefined || list === null) return;
  if (!Array.isArray(list)) {
    throw new TypeError(`.${ name } must be an array, or undefined (received ${ JSON.stringify(list) })`);
  }
  for (const item of list) {
    if (typeof item !== 'string' && !(item instanceof RegExp)) {
      throw new TypeError(`.${ name } elements must be strings or regular expressions (received ${ JSON.stringify(item) })`);
    }
  }
}

// generate a unique identifier name following Babel's hint-N convention.
// startSuffix === null means try the bare prefix first; otherwise start with `prefix${startSuffix}`
// on collision the suffix is incremented but clamped to minSuffix
// (pass minSuffix=2 to skip the unused `prefix1` slot, matching Babel's UID generator)
// isTaken is called for each candidate; return true when the name conflicts
export function findUniqueName(prefix, startSuffix, minSuffix, isTaken) {
  let counter = startSuffix;
  let name = counter === null ? prefix : `${ prefix }${ counter }`;
  while (isTaken(name)) {
    counter = Math.max((counter ?? 0) + 1, minSuffix);
    name = `${ prefix }${ counter }`;
  }
  return name;
}
