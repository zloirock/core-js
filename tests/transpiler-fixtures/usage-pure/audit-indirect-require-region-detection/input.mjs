// indirect require shapes - SequenceExpression callee (`(0, require)('a')`),
// OptionalCallExpression (`require?.('b')`), MemberExpression tail (`require('c').default`)
// must register as part of the leading import region. unplugin's `isRequireCall` mirrors
// babel-plugin's peel-chain so `var _ref;` insertion respects `import/first` across
// indirect-require shapes
const a = (0, require)('a');
require?.('b');
const c = require('c').default;
const arr = [a, c];
arr.at(-1);
