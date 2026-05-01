// `f(inst)` passes the instance to a function whose body could mutate `p.x` to any type.
// the alias closure can't follow the value through the function boundary - inter-procedural
// analysis is out of scope. soundness contract: bail on the field's narrow whenever any
// instance reference escapes via a non-member non-alias-creation channel. without this gate,
// a write inside `f` to `p.x = "string"` would leave the narrow at `_atMaybeArray`, which
// crashes on old engines (`String.prototype.at` undefined -> `it.at` undefined -> TypeError)
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
