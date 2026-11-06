export function unknownFallback(r, keys) {
  var k, e = 2;
  for ("undefined" != typeof Symbol && (k = Symbol.iterator); e--;) {
    if (k && r[k]) return r[k];
    [k] = keys;
  }
}
