// removing the entry import must not fuse the `}` of the prev function-expression
// initializer onto the `(` of the next IIFE call - without an injected `;`, the parser
// sees `let x = function () { return 42; }(function () { ... })()` which calls the prev
// function with the IIFE as arg instead of two separate statements. `}` does not end
// with `;` so the backward scan must trigger the ASI hazard guard
let x = function () { return 42; }
import 'core-js/actual/promise/try'
(function () { Promise.try(() => 1); })();
