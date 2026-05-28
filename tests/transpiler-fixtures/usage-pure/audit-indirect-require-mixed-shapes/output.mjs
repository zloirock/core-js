import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// mix of indirect-require shapes used by webpack / esbuild output: SequenceExpression
// callee `(0, require)(...)`, OptionalCallExpression `require?.(...)`, MemberExpression
// tail `require(...).default` (assigned to var) - all three must be treated as part of
// the leading import region so injected `var _ref;` (if any) lands AFTER them, not
// between user imports and indirect requires (which would trip `import/first`)
const a = (0, require)('a');
const b = require?.('b');
const c = require('c').default;
const arr = [a, b, c];
_includesMaybeArray(arr).call(arr, 'x');