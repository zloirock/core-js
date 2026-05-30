import _at from "@core-js/pure/actual/instance/at";
// a dynamic computed-key member as a for-of loop variable (`for (c[k] of ...)`) rebinds an
// unenumerable field each iteration - same unenumerable-write channel as destructuring. the
// field narrow must bail and `.at` widens to the generic instance helper
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
declare const k: string;
const c = new C();
for (c[k] of [["x"]]) {}
c.first();