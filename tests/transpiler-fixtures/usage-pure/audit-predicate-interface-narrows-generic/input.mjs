// a generic target substitutes its type arguments
interface Box<T> { val: T }
function isBox(o: unknown): o is Box<number[]> { return true; }
function gx(v: unknown) {
  if (isBox(v)) {
    v.val.at(0);
    v.val.copyWithin(0, 1);
  }
}
