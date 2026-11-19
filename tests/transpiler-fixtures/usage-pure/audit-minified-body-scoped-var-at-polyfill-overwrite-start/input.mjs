// minified function body where the polyfill statement starts at the byte right after
// `{`, so the scoped `var _ref;` insert lands at the same offset as the polyfill range
// overwrite. insert-before-overwrite drain ordering keeps the insert anchored to the
// post-overwrite intro slot - inverse ordering drops the declaration and the user file
// would `ReferenceError` under strict mode
function f(){arr.at?.(0).map(y => y)}
