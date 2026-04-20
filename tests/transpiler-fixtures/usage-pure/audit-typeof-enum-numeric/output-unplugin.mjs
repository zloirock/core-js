var _ref;
import _toExponentialMaybeNumber from "@core-js/pure/actual/number/instance/to-exponential";
// `typeof Enum` with a numeric enum — `resolveAnnotatedMember`'s TSTypeQuery branch
// maps each member to `$Primitive('number')` via `resolveEnumMemberType`; `.toExponential`
// on a number narrows to the Number instance method
enum Num { A = 1, B = 2 }
declare const e: typeof Num;
_toExponentialMaybeNumber(_ref = e.A).call(_ref, 2);