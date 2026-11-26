interface Box<T> { val: T }
function isBox(o: unknown): o is Box<number[]> { return true; }
// the ternary nullable fold composes with a predicate-narrowed receiver
function gt(v: unknown, c: boolean) {
  if (isBox(v)) {
    (c ? v.val : null)?.at(0);
    (c ? v.val : null).entries();
  }
}
