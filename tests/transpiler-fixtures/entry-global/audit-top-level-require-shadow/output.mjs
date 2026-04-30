// User-shadowed `require` at top-level (declared via const) - the binding shadows the
// CJS-runtime function, so `require('core-js')` is calling user code, not the CJS loader.
// Entry detection must skip via the `declaresRequireBinding` shadow scope.
const require = msg => msg;
require('core-js/actual/promise');