import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
const f = _Array$from;
// a polyfillable side-effecting computed key (`[(eff(), 'from')]`) FLANKED by sibling computed keys
// whose prefixes also have side effects, on both sides. the effect can't be lifted out - it must run in
// source order between the siblings' effects - so the key stays in the residual pattern with its value
// renamed to a throwaway, and the polyfill is extracted to a separate `const f = _Array$from`. both
// plugins emit identically: order before(), eff(), after() preserved, siblings x/y bound, polyfill wins
const {
  [(before(), 'x')]: x,
  [(effectful(), 'from')]: _unused,
  [(after(), 'y')]: y
} = Array;
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);