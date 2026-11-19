// A for-of shadow from an opaque iterable widens the global family only in usage-global.
function hand(x) {
  globalThis.taken = x;
}
for (const URL of list) hand(URL);
new URL('x');
