// `export const require = ...` shadows the builtin at module scope exactly like plain
// `const require = ...`; `require('core-js/...')` must NOT be treated as a core-js entry
export const require = m => m;
require('core-js/actual/array/at');