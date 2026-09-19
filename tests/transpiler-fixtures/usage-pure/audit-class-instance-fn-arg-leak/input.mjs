// `leak(inst)` passes the instance to a function whose body could mutate the field to any
// type, and the alias closure can't follow it across the function boundary (no inter-procedural
// analysis). SOUNDNESS: bail on the field narrow whenever an instance ref escapes via a non-
// member non-alias channel, else `_atMaybeArray` emits and crashes on old engines (`it.at` undefined)
class C {
  arr = [1, 2, 3];
  test() {
    return this.arr.at(0);
  }
}
function leak(p) { p.arr = "stringified"; }
const inst = new C();
leak(inst);
inst.test();
