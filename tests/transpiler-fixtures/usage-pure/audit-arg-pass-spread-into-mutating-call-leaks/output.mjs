import _Object$assign from "@core-js/pure/actual/object/assign";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// spread `o` into a CallExpression whose callee has `mutatesArgument` annotated:
// `Object.assign(...o)`. spread sits at AST index 0; mutating slot is also 0; the
// SpreadElement branch widens the check to "any annotated index >= spread position",
// so target slot 0 is reachable -> classifier falls through to 'leak'. negative-by-design
// lock: ensures sound over-bail when spread expansion intersects a per-slot mutation profile
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Object$assign(...o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();