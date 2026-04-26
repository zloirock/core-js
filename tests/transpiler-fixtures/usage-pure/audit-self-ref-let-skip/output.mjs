// `let X = X` is a runtime TDZ (ReferenceError) - unlike `var`, it doesn't hoist to
// `undefined`. only `var` self-references are rewritten; the user's TDZ error is left
// to surface as-is for `let` and `const`
let Map = Map;
new Map();