// A binding written in an arm of a ternary or logical expression this build always answers takes
// the type that arm settles, as its `if` spelling does: a write in the arm the build always takes is
// unconditional, one in the arm it never takes leaves the value before it. An undecided test keeps
// every value.
export function ternary(source) {
  let value = source;
  typeof Promise != 'undefined' ? (value = 'abc') : (value = [1]);
  return value.slice(1);
}

export function and(source) {
  let value = source;
  typeof Promise != 'undefined' && (value = 'abc');
  return value.includes('b');
}

export function or(source) {
  let value = source;
  typeof Promise == 'undefined' || (value = 'abc');
  return value.concat('d');
}

export function undecided(source) {
  let value = source;
  globalThis.flag ? (value = 'abc') : (value = [1]);
  return value.at(0);
}
