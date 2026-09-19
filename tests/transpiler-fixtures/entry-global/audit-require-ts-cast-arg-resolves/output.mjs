// `require('core-js/...' as any)` - TS cast on the string literal argument. shared adapter
// unwrap peels TS wrappers so the entry registers in both babel-plugin and unplugin paths
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");