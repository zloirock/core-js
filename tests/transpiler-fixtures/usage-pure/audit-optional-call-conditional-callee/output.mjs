import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// a CONDITIONALLY-assigned optional callee short-circuits through its own `?.()`: the yield is
// a source of undefined nothing above re-tests, so every claim channel keeps a test on the call
// value. an UNCONDITIONAL callee keeps its collapse (the link is proven-defined), and the plain
// call keeps its own throw. the delete row targets a ctor no other row here claims - a deleted
// slot deoptimizes its name for the whole file
let condFn;
if (_globalThis.setTimeout) condFn = () => _globalThis;
export const condCalleeStaticCall = null == condFn?.() ? void 0 : _Array$of(12);
export const condCalleeStaticRead = null == condFn?.() ? void 0 : _Array$of;
export const condCalleeStaticField = null == condFn?.() ? void 0 : _Number$MAX_SAFE_INTEGER;
export const condCalleeTypeof = typeof (null == condFn?.() ? void 0 : _Array$of);
export const condCalleeWellKnown = null == condFn?.() ? void 0 : _Symbol$iterator;
export const condCalleeDeepHop = null == condFn?.() ? void 0 : _Array$of(13);
export const {
  of: condCalleeDestructured
} = condFn?.()?.Array ?? {};
export const condCalleePlainCall = _globalThis.setTimeout ? null == condFn() ? void 0 : _Array$of(14) : null;
export const condCalleeInstanceMemo = null == (_ref = condFn?.()) ? void 0 : _atMaybeArray(_ref.Array.prototype).call([7], 0);
export const condCalleeDelete = delete (null == condFn?.() ? void 0 : _Map)?.groupBy;
const condNavFn = () => _globalThis.window;
export const optionalNavCalleeGuard = null == condNavFn?.() ? void 0 : _Array$of(15);

// controls: the proven twin collapses, exactly as the opaque-root family locks it
const provenFn = () => _globalThis;
export const provenCalleeCollapse = _Array$of(16);