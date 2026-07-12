import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// an optional call through a NON-polyfillable member with a side-effecting computed key:
// the key effect runs exactly once in every emission shape, and the callee's `this` binding
// is preserved. the emitters legitimately differ in how they respell the member read
let eff = () => {};
const arr = { foo: () => [[1], [2]] };
export const viaIdentKey = null == (_ref = (eff(), arr.foo)) ? void 0 : _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _ref.call(arr)).call(_ref3)).call(_ref2, 0);

// a resolved key that is NOT a bare identifier keeps a bracket read (a dot respelling
// would reparse `arr.a-b` as subtraction)
const box = { 'a-b': () => [[1], [2]] };
export const viaOddKey = null == (_ref4 = (eff(), box['a-b'])) ? void 0 : _findLastMaybeArray(_ref5 = _flatMaybeArray(_ref6 = _ref4.call(box)).call(_ref6)).call(_ref5, v => v > 0);

// a SINGLE trailing polyfill routes through the method-call recipe: the memoized callee
// must keep its `this` binding (`.call(recv)`), the key effect staying in the memo slot
const kit = { pick: () => [1, 2] };
export const viaSingleHop = null == (_ref7 = kit[(eff(), 'pick')]) ? void 0 : _includesMaybeArray(_ref8 = _ref7.call(kit)).call(_ref8, 2);

// a STATIC callee with a side-effecting computed key composes the effect ahead of the
// substituted static - no receiver binding is needed for a standalone static
export const viaStaticKey = (eff(), _Promise$resolve)(1);