// a loop key that only resembles the helpers' lookup keeps its native read: a fallback other than
// `'@@iterator'` or one unknown here, the async symbol beside the iterator fallback, a test the build
// may answer false, and a write the first pass reaches only after the read
export function otherFallback(r) {
  var k, e = 2;
  for ("undefined" != typeof Symbol && (k = Symbol.iterator); e--;) {
    if (k && r[k]) return r[k];
    k = "iterator";
  }
}
