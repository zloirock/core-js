import _at from "@core-js/pure/actual/instance/at";
// a dynamic computed-key member as an object-destructuring-assignment target (`({ p: c[k] } = o)`)
// writes an unenumerable field of the instance - same mutation channel as array destructuring.
// the field narrow `this.box -> Array` must bail and `.at` widens to the generic instance helper
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
declare const k: string;
const c = new C();
({
  p: c[k]
} = {
  p: "hi"
});
c.first();