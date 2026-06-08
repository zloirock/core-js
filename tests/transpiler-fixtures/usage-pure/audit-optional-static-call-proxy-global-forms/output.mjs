import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref, _ref2;
// proxy-global static optional calls resolve through the SAME canonical chain resolver the emit side
// uses, so EVERY proxy-global form deopts to the always-defined static (not a guarded native member):
// a const-alias of the global, a nested proxy chain, and a computed proxy base. before delegating to
// the shared resolver, only the single-level bare-base form deopted and these collided into `_X$callcall`
const g = _globalThis;
export const a = _atMaybeArray(_ref = _Array$from()).call(_ref, 0);
export const b = _flatMaybeArray(_ref2 = _Array$of()).call(_ref2);
export const c = _Promise$resolve().then(x => x);