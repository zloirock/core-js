import _at from "@core-js/pure/actual/instance/at";
// `(!function () { x = "hi"; })()` invokes the BOOLEAN result of negating the function
// reference, NOT the function itself - body writes never run at runtime (TypeError on
// calling a boolean). a UnaryExpression between the callee and the CallExpression must not
// be treated as an IIFE, so the inner write seeds no narrow and `.at(0)` stays generic.
var x;
(!function () {
  x = "hi";
})();
var first = _at(x).call(x, 0);