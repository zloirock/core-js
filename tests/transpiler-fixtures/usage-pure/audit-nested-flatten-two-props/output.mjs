import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
var _ref;
const f = _Array$from;
// Nested proxy-global destructure with two polyfillable keys on the inner pattern.
// Each prop gets an independent extracted declaration; the outer declaration's inner
// pattern should shrink one prop at a time, and the final extraction should collapse
// the whole `const { Array: {} } = globalThis` shape away
const o = _Array$of;
const result = _concatMaybeArray(_ref = f([1])).call(_ref, o(2));
export { result };