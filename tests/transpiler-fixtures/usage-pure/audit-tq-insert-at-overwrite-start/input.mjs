// regression: minified function body where the polyfill statement starts at the byte
// right after `{`, so scope-tracker `queue.insert(insertPos, '...var _ref;...')` lands
// at exactly the same offset as the polyfill `queue.add(start, end, ...)`. pre-fix
// MagicString `appendRight(insertPos)` was ANCHORED to a chunk that the subsequent
// `overwrite(insertPos, end)` replaced, silently dropping the `var _ref;` declaration -
// runtime ReferenceError under strict mode. fix: drain inserts AFTER overwrites in
// `TransformQueue.apply()` so each `appendRight(pos)` lands on the post-overwrite chunk's
// intro slot (preserved across the overwrite)
function f(){arr.at?.(0).map(y => y)}
