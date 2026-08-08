import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `export { x }` without a `from` clause re-exports a LOCAL binding (declared elsewhere
// in the file). It is NOT a module-record fetch and must NOT count as the import header:
// once the scan hits this statement, the import region ends and any subsequent polyfill
// `var _ref;` should land BEFORE this local re-export. distinct methods so per-line
// dispatch is visible in output
import { foo } from './lib-foo.mjs';
var _ref, _ref2;
const local1 = 1;
const local2 = 2;
export { local1, local2 };
declare function getArr(): unknown[];
const a = _atMaybeArray(_ref = getArr()).call(_ref, 0);
const b = _flatMaybeArray(_ref2 = getArr()).call(_ref2);