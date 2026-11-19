import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
export function writtenAfter(r) {
  var k,
    e = 2;
  for (; e--; k = _Symbol$iterator) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}