import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
var _ref;
// `typeof Num` where Num is a numeric enum - each enum member's type narrows to `number`,
// so `e.A.toExponential(2)` routes through Number.prototype.toExponential. enum members
// with numeric initialisers / initialisers that arithmetic-compose from numeric literals
// carry that primitive through the TSTypeQuery annotation chain
enum Num { A = 1, B = 2 }
declare const e: typeof Num;
_toExponentialMaybeNumber(_ref = e.A).call(_ref, 2);