import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
const f = _Array$from;
const g = _Array$of;
// two ADJACENT polyfillable side-effecting computed keys (`from` + `of`). each effect must run in source
// order, so neither key is lifted out: both stay in the residual pattern (values renamed to throwaways)
// and each polyfill is extracted to its own preceding `const`. order eff1(), eff2() preserved, both win
const {
  [(eff1(), 'from')]: _unused,
  [(eff2(), 'of')]: _unused2
} = Array;
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);