'use strict';
// Use-strict directive then a complex receiver that requires `_ref` memoization.
// `getObj()` is not identifier-safe so memoize returns `[(_ref = getObj()), _ref]`.
// `var _ref;` declarator must land AFTER the auto-injected polyfill imports, before
// user code; this is what reorderRefsAfterImports synthesizes.
const a = getObj().flat();
const b = makeStr().padEnd(8);
