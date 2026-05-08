import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `var _ref;` placement must come AFTER all leading import-like statements: ESM
// imports, re-exports (`export ... from`, `export *`), AND CJS `var X = require(...)`.
// otherwise the ref lands between the imports and the re-export, breaking ordering
import { foo } from './lib-foo.mjs';
export { bar } from './lib-bar.mjs';
export * from './lib-all.mjs';
var fs = require('fs');
var _ref, _ref2;
declare function getArr(): unknown[];
const a = _atMaybeArray(_ref = getArr()).call(_ref, 0);
const b = _flatMaybeArray(_ref2 = getArr()).call(_ref2);