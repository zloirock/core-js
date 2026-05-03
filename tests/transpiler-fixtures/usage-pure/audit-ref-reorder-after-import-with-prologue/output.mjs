'use strict';

// Use-strict directive then a complex receiver that requires `_ref` memoization.
// `getObj()` is not identifier-safe so memoize returns `[(_ref = getObj()), _ref]`.
// `var _ref;` declarator must land AFTER the auto-injected polyfill imports, before
// user code; this is what reorderRefsAfterImports synthesizes.
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
var _ref, _ref2;
const a = _flatMaybeArray(_ref = getObj()).call(_ref);
const b = _padEndMaybeString(_ref2 = makeStr()).call(_ref2, 8);