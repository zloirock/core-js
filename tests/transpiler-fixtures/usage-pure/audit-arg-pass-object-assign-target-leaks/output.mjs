import _Object$assign from "@core-js/pure/actual/object/assign";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Object.assign(o, src)` mutates the target arg (index 0). known-built-in-return-types.json
// flags Object.assign with `mutatesArgument: [0]`; classifier sees `o` at the mutating slot
// and returns 'leak'. alias closure for `o` becomes null, narrowing on `arr` is abandoned -
// `.at(0)` / `.includes(0)` fall back to the generic polyfills (`_at` / `_includes`) which
// dispatch by feature detection on the actual receiver shape at call time. negative-by-design
// lock: even though Object.assign returns the target, the in-place mutation invalidates any
// pre-call type narrow we might have inferred from the property init
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(o, {
      x: 1
    });
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();