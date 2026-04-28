import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// minified function body where the polyfill statement starts at the byte right after
// `{`, so the scope-tracker insert (`var _ref;` decl) lands at exactly the same offset
// as the polyfill range overwrite. Insert-then-overwrite drain ordering keeps the insert
// anchored to the post-overwrite chunk's intro slot - inverse ordering would silently
// drop the declaration and the user file would `ReferenceError` under strict mode
function f() {
  var _ref, _ref2;
  null == arr || null == (_ref = _at(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr, 0)).call(_ref2, y => y);
}