import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// proxy-global alias with default + static-method member call: `P` is recognised as
// a Promise binding, so `P.try(() => 1)` keeps resolving to the static method polyfill
// even after the default-value rewrite
const P = _Promise === void 0 ? null : _Promise;
_Promise$try(() => 1);