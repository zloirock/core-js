import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// re-export `export { name } from 'mod'` and bare `export * from 'mod'` are top-level
// import-region for reorderRefsAfterImports. when the file mixes user re-exports and
// uses polyfilled instance methods + chained inner-poly chain (which generates `_ref`
// vars), generated `_ref` must be reordered to land AFTER all imports including
// re-exports - empty `var _ref` declaration must not slip between import and re-export
export { externalA } from './audit-stub-a.mjs';
export * from './audit-stub-b.mjs';
var _ref, _ref2;
const arr = [1, 2, 3];
const out1 = (arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 0))?.findLast(x => x > 0);
const out2 = null == arr || null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _ref.call(arr)) ? void 0 : _flatMapMaybeArray(_ref2).call(_ref2, x => [x]);
export { out1, out2 };