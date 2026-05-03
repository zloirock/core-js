// `import * as ns from 'core-js/pure/actual/symbol/iterator'; ns.default in obj` -
// namespace-specifier bindings are NOT recognized as Symbol.iterator refs by `bindingSymbolKey`
// (only ImportDefault / `import { default as X }` pass `bindsModuleDefault`). namespace member
// access tracking is intentionally out of scope (see TASKS §6 verified-not-bugs).
// the `in` check falls through the symbol-sourced detection and stays as a plain `in`
import * as ns from '@core-js/pure/actual/symbol/iterator';
const v = ns.default in obj;
export { v };