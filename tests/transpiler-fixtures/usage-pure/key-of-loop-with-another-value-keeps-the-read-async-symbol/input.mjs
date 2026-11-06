export function asyncSymbol(r) {
  var k, e = 2;
  for ("undefined" != typeof Symbol && (k = Symbol.asyncIterator); e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}
