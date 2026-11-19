// mix of indirect-require shapes used by webpack / esbuild output: SequenceExpression callee
// `(0, require)(...)`, optional `require?.(...)` (oxc wraps it in a ChainExpression), MemberExpression
// tail `require(...).default` (assigned to var) - all three are the leading import region. the
// array-literal receiver forces a memoize `var _ref;`, which must land AFTER the three requires, not
// between them and the injected import (which would trip `import/first`)
const a = (0, require)('a');
const b = require?.('b');
const c = require('c').default;
[a, b, c].includes('x');
