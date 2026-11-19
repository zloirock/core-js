// `var _ref;` placement must come AFTER all leading import-like statements: ESM
// imports, re-exports (`export ... from`, `export *`), AND CJS `var X = require(...)`.
// otherwise the ref lands between the imports and the re-export, breaking ordering
import { foo } from './lib-foo.mjs';
export { bar } from './lib-bar.mjs';
export * from './lib-all.mjs';
var fs = require('fs');
declare function getArr(): unknown[];
const a = getArr().at(0);
const b = getArr().flat();
