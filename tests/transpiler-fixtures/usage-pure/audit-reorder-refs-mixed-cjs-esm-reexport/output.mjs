import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// mixed import region: ESM `import`, ESM `export ... from`, ESM `export *`, and a
// CJS-style `var X = require(...)` declarator must ALL count as the leading import
// region for `var _ref;` placement. without re-export accept in the import-region
// predicate, the scan would bail on the first `export ... from` and `_ref` would land
// between import and re-export - lint `import/first` would warn. the `getArr()` call
// forces a `_ref` allocation so the placement is observable in output. distinct methods
// per polyfill site (`.at(0)` and `.flat()`) so per-line dispatch is visible
import { foo } from './lib-foo.mjs';
export { bar } from './lib-bar.mjs';
export * from './lib-all.mjs';
var fs = require('fs');
var _ref, _ref2;
declare function getArr(): unknown[];
const a = _atMaybeArray(_ref = getArr()).call(_ref, 0);
const b = _flatMaybeArray(_ref2 = getArr()).call(_ref2);