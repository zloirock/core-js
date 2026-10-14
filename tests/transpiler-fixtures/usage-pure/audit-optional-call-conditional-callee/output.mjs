import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
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
export const condCalleeStaticRead = null == condFn?.() ? void 0 : _Array$from;
export const condCalleeStaticField = null == condFn?.() ? void 0 : _Number$MAX_SAFE_INTEGER;
export const condCalleeTypeof = typeof (null == condFn?.() ? void 0 : _Object$fromEntries);
export const condCalleeWellKnown = null == condFn?.() ? void 0 : _Symbol$iterator;
export const condCalleeDeepHop = null == condFn?.() ? void 0 : _Math$trunc(13.5);
export const {
  values: condCalleeDestructured
} = (null == condFn?.() ? void 0 : {
  values: _Object$values
}) ?? {};
export const condCalleePlainCall = _globalThis.setTimeout ? null == condFn() ? void 0 : _String$fromCodePoint(14) : null;
export const condCalleeInstanceMemo = null == (_ref = condFn?.()) ? void 0 : _atMaybeArray(_ref.Array.prototype).call([7], 0);
export const condCalleeDelete = null == condFn?.() ? true : delete _Map.groupBy;
const condNavFn = () => _globalThis.window;
export const optionalNavCalleeGuard = null == condNavFn?.() ? void 0 : _Number$isInteger(15);

// controls: the proven twin collapses, exactly as the opaque-root family locks it
const provenFn = () => _globalThis;
export const provenCalleeCollapse = _Math$sign(-16);