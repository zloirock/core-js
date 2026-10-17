import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
export function unknownFallback(r, keys) {
  var k,
    e = 2;
  for (k = _Symbol$iterator; e--;) {
    if (k && r[k]) return r[k];
    [k] = keys;
  }
}