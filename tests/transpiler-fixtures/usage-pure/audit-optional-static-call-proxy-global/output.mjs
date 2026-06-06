import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2, _ref3;
// optional call on a proxy-global static method (`globalThis.Array.from?.()`). the static resolves to
// the same always-defined polyfill as the bare form (`Array.from?.()` -> `_Array$from`), so the `?.`
// deoptimizes: the proxy-global chain must be recognized as the static just like the bare identifier,
// else it falls into the generic optional-chain path and emits a guarded native `.from`. the trailing
// instance method composes on the call result. a bound (shadowed) global keeps its guard - see the
// audit-optional-static-call-proxy-global-shadowed fixture
export const a = _atMaybeArray(_ref = _Array$from()).call(_ref, 0);
export const b = _flatMaybeArray(_ref2 = _Array$of()).call(_ref2);
export const c = _findLastMaybeArray(_ref3 = _Array$from()).call(_ref3, x => x);