import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
export function asyncSymbol(r) {
  var k,
    e = 2;
  for (k = _Symbol$asyncIterator; e--;) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}