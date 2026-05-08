import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// TSNonNullExpression `!` wrapper around an SE-tail destructure init: same TS-peel path
// as `as` / `satisfies`, must reach the receiver through the wrapper so the flatten fires
// AND `auditCall()` gets lifted as a standalone statement, not silently dropped
declare function auditCall(): void;
auditCall();
const resolve = _Promise$resolve;
resolve(1);