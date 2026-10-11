import _Array$from from "@core-js/pure/actual/array/from";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a parameter's writes are ordered as any binding's: the read takes the write that runs last, the plain
// later one or a static field value above the class key that writes it as well, in both legs - the
// estree tracker records a parameter write as its target identifier, placed through its assignment
export function plainLater(K) {
  K = 'of';
  K = 'from';
  return _Array$from([1]);
}
export function fieldOverKey(N) {
  class Holder {
    static held = N = 'groupBy';
    [(N = 'fromEntries', 'n')] = 1;
  }
  return _Object$groupBy([1], x => x);
}