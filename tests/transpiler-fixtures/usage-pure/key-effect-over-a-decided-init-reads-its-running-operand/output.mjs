import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a computed key consuming the whole declaration over a selection the build decides reads as over the
// operand that runs: a bare binding is read in place, and a decided `&&` yields its right as a ternary does
export const log = [];
export const of = (_pushMaybeArray(log).call(log, 'of'), _Array$of);
export const attempt = (_pushMaybeArray(log).call(log, 'init'), _pushMaybeArray(log).call(log, 'try'), _Promise$try);