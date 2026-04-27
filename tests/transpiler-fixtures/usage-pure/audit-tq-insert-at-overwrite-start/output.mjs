import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// regression: minified function body where the polyfill statement starts at the byte
// right after `{`, so scope-tracker `queue.insert(insertPos, '...var _ref;...')` lands
// at exactly the same offset as the polyfill `queue.add(start, end, ...)`. pre-fix
// MagicString `appendRight(insertPos)` was ANCHORED to a chunk that the subsequent
// `overwrite(insertPos, end)` replaced, silently dropping the `var _ref;` declaration -
// runtime ReferenceError under strict mode. fix: drain inserts AFTER overwrites in
// `TransformQueue.apply()` so each `appendRight(pos)` lands on the post-overwrite chunk's
// intro slot (preserved across the overwrite)
function f() {
  var _ref, _ref2;
  null == arr || null == (_ref = _at(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr, 0)).call(_ref2, y => y);
}