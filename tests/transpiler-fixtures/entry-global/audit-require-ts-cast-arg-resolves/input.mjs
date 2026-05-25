// `require('core-js/...' as any)` - TS cast on the string literal argument. shared adapter
// unwrap peels TS wrappers so the entry registers in both babel-plugin and unplugin paths
require('core-js/actual/array/from' as any);
