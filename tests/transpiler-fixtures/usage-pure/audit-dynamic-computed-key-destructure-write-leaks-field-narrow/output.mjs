import _at from "@core-js/pure/actual/instance/at";
// a dynamic computed-key member as a destructuring-assignment target (`[c[k]] = v`) writes an
// unenumerable field of the instance - `k` could be "box", overwriting the array field with a
// string. the instance escapes, so the field narrow `this.box -> Array` must bail: `.at` widens
// from the array-only helper to the generic instance helper (sound for array OR string)
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
declare const k: string;
const c = new C();
[c[k]] = ["hi"];
c.first();