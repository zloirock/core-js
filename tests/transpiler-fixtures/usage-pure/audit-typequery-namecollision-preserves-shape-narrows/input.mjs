// Value-binding `T` and interface type-param `T` share a name; `typeof T` must address the value space.
// Substitution must skip value-space refs in `typeof` queries so `b.val` keeps its runtime array shape.
const T = [1, 2, 3];
interface Box<T> {
  val: typeof T;
}
declare const b: Box<string>;
const head = b.val.at(0);
const idx = b.val.findLastIndex(x => x > 0);
export { head, idx };
