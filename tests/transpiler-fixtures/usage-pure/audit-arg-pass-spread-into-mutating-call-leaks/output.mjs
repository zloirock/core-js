import _Object$assign from "@core-js/pure/actual/object/assign";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// spread `o` into a CallExpression whose callee has `mutatesArgument` annotated:
// `Object.assign(...o)`. spread arity is unknown at static time - o's spread elements
// could land at any position, including the mutating slot (target at index 0). helper
// returns false from the SpreadElement branch when ANY mutating slot exists; classifier
// falls through to 'leak'. negative-by-design lock: ensures sound over-bail when spread
// ambiguity intersects with a per-slot mutation profile
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