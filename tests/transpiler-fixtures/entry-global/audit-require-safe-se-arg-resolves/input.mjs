// `require((0, 'core-js/...'))` - safe SequenceExpression around the string literal argument
// (no observable side effects in the prefix). shared adapter unwrap peels the safe SE tail
// so the entry registers in both babel-plugin and unplugin paths
require((0, 'core-js/actual/promise'));
