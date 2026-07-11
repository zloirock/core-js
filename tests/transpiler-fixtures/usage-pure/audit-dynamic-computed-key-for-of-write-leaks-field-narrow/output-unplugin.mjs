import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
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

// a plain-binding write buried in the for-of LEFT (pattern default) runs 0+ times: the
// binding is a union past the loop, so the dispatch stays generic - neither the stale
// init narrow nor the stale write narrow may win
let held = [1, 2];
for (const { q = (held = 's') } of maybe) { void q; }
export const widened = _includes(held).call(held, 1);