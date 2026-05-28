import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// minified function body where the polyfill statement starts at the byte right after
// `{`, so the scoped `var _ref;` insert lands at the same offset as the polyfill range
// overwrite. insert-before-overwrite drain ordering keeps the insert anchored to the
// post-overwrite intro slot - inverse ordering drops the declaration and the user file
// would `ReferenceError` under strict mode
function f(){
var _ref, _ref2;null == arr || null == (_ref = _at(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr, 0)).call(_ref2, y => y)}