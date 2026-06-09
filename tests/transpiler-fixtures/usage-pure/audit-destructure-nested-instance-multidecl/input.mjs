// a nested INSTANCE method in a MULTI-declarator. a preceding `const m = _flatMaybeArray(arr)` could
// TDZ-fault a receiver bound earlier in the SAME declaration, so the polyfill binds as a TRAILING sibling
// declarator instead (`..., m = _flatMaybeArray(arr)`) - which runs after the receiver and is always safe.
// the planner once bailed this shape (and emitters diverged: babel polyfilled, unplugin left it native)
const arr = [1, [2]];
const z = 1, { y: { flat: m } } = { y: arr };
