export function writtenAfter(r) {
  var k, e = 2;
  for (; e--; k = Symbol.iterator) {
    if (k && r[k]) return r[k];
    k = "@@iterator";
  }
}
