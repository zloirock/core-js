// `export { x }` without a `from` clause re-exports a LOCAL binding (declared elsewhere
// in the file). It is NOT a module-record fetch and must NOT count as the import header:
// once the scan hits this statement, the import region ends and any subsequent polyfill
// `var _ref;` should land BEFORE this local re-export. distinct methods so per-line
// dispatch is visible in output
import { foo } from './lib-foo.mjs';
const local1 = 1;
const local2 = 2;
export { local1, local2 };
declare function getArr(): unknown[];
const a = getArr().at(0);
const b = getArr().flat();
