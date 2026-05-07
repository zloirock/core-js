import _Reflect$set from "@core-js/pure/actual/reflect/set";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `Reflect.set(target, key, ...o)` - SpreadElement at AST index 2; mutatesArgument [0, 3]
// includes the receiver slot (index 3). naive `includes(2)` check would miss this since
// the spread itself sits at index 2, but at runtime spread expands to positions 2, 3, 4...
// and index 3 is the mutating receiver slot. SpreadElement branch widens to "any annotated
// index >= AST position", correctly classifying as 'leak'. negative-by-design lock for the
// PROV-CLF-1 spread-expansion soundness fix
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    _Reflect$set(target, "x", ...o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
o.test();