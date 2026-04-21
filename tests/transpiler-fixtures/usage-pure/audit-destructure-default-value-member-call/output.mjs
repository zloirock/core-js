import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// proxy-global alias with default + static-method member call. babel mutates to
// `const P = _Promise === void 0 ? null : _Promise`; `registerGlobalAlias('P', 'Promise')`
// keeps `P.try(...)` resolving to `_Promise$try`
const P = _Promise === void 0 ? null : _Promise;
_Promise$try(() => 1);