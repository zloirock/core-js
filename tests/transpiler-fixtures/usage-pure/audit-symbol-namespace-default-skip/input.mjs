// namespace-specifier import (`import * as ns`) accessed via `ns.default` is NOT
// recognized as a well-known Symbol reference; only direct default / named-default
// specifiers are tracked. the `in` check stays plain - intentionally out of scope
import * as ns from '@core-js/pure/actual/symbol/iterator';
const v = ns.default in obj;
export { v };
