import _Map from "@core-js/pure/actual/map/constructor";
// shadowed `require` - declaresRequireBinding detects `const require = ...` and marks
// subsequent `require('core-js/...')` calls as user-authored, not polyfill entries.
// scanExistingCoreJSImports skips these - no dedup, no specifier matching
const require = (x) => null;
require('@core-js/pure/actual/map');
_Map;