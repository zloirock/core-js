import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref, _ref2, _ref3;
// the same defect with TWO trailing polyfilled hops (routes through the multi-poly compose path,
// not the single-poly standalone path): a non-static member optional call must still preserve its
// guard so the whole chain short-circuits to undefined instead of calling a non-existent static
const r = null == (_ref = _Promise.noSuchStatic) ? void 0 : _at(_ref2 = _flatMaybeArray(_ref3 = _ref.call(_Promise)).call(_ref3)).call(_ref2, 0);
r;