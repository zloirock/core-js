// the async iterator helpers look the method up in a loop: the key holds the well-known symbol a test
// the build decides installs before the loop, then its `'@@iterator'` fallback, and the iterator method
// answers either one. so a read keyed by it is that method - tested, held, behind `in` or called -
// while the async key beside it and a write keyed by it keep the alias
function _asyncIterator(r) {
  var n, t, o, e = 2;
  for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) {
    if (t && null != (n = r[t])) return n.call(r);
    if (o && null != (n = r[o])) return n.call(r);
    t = "@@asyncIterator", o = "@@iterator";
  }
  throw new TypeError("Object is not async iterable");
}
export const lookup = _asyncIterator;
export function positions(r) {
  var k, e = 2;
  for ("function" == typeof Symbol && (k = Symbol.iterator); e--;) {
    var held = r[k];
    if (k in r) return r[k]();
    r[k] = held;
    k = "@@iterator";
  }
}
