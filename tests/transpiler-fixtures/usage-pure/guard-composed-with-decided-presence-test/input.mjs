// A guard composed with a presence test this build always answers narrows by the part of the
// test that runs: a test always false leaves `||` to its right, one always true leaves `&&` to its
// right. A test always true over `||` and an undecided one narrow nothing.
export function either(x) {
  if (typeof Promise == 'undefined' || typeof x == 'string') return x.at(0);
}

export function exit(x) {
  if (typeof Promise != 'undefined' && typeof x != 'string') return;
  return x.includes('b');
}

export function alwaysTrue(x) {
  if (typeof Promise != 'undefined' || typeof x == 'string') return x.slice(1);
}

export function undecided(x) {
  if (globalThis.flag || typeof x == 'string') return x.concat('d');
}
