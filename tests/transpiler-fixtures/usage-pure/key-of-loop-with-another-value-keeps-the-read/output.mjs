import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a loop key that only resembles the helpers' lookup keeps its native read: a fallback other than
// `'@@iterator'` or one unknown here, the async symbol beside the iterator fallback, a test the build
// may answer false, and a write the first pass reaches only after the read
export function otherFallback(r) {
  var k,
    e = 2;
  for (k = _Symbol$iterator; e--;) {
    if (k && r[k]) return r[k];
    k = "iterator";
  }
}
export function unknownFallback(r, keys) {
  var k,
    e = 2;
  for (k = _Symbol$iterator; e--;) {
    if (k && r[k]) return r[k];
    [k] = keys;
  }
}
export function asyncSymbol(r) {
  var k,
    e = 2;
  for (k = _Symbol$asyncIterator; e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}
export function undecided(r, flag) {
  var k,
    e = 2;
  for (flag && (k = _Symbol$iterator); e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}
export function writtenAfter(r) {
  var k,
    e = 2;
  for (; e--; k = _Symbol$iterator) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}