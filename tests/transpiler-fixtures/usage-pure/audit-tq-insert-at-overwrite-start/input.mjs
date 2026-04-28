// minified function body where the polyfill statement starts at the byte right after
// `{`, so the scope-tracker insert (`var _ref;` decl) lands at exactly the same offset
// as the polyfill range overwrite. Insert-then-overwrite drain ordering keeps the insert
// anchored to the post-overwrite chunk's intro slot - inverse ordering would silently
// drop the declaration and the user file would `ReferenceError` under strict mode
function f(){arr.at?.(0).map(y => y)}
