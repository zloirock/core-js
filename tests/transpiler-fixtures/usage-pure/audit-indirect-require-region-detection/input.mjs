// indirect-require shapes - SequenceExpression callee `(0, require)('a')`, optional `require?.('b')`
// (oxc wraps it in a ChainExpression), MemberExpression tail `require('c').default` - all register as
// the leading import region. the array-literal receiver forces a memoize `var _ref;`, which must land
// AFTER the three requires, not between them and the injected import (which would trip `import/first`)
const a = (0, require)('a');
require?.('b');
const c = require('c').default;
[a, c].at(-1);
