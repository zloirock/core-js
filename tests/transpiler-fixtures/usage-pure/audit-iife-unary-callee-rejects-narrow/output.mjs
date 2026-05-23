import _at from "@core-js/pure/actual/instance/at";
// `(!function () { x = "hi"; })()` invokes the BOOLEAN result of negating the
// function reference, NOT the function itself - body writes never run at runtime
// (TypeError on calling boolean). previously findEnclosingIIFE accepted
// UnaryExpression between the FE/Arrow and the CallExpression because UnaryExpression
// was in IIFE_CALL_PATH_WRAPPERS (which is for wrappers ABOVE the call, not BELOW
// its callee). with the narrower IIFE_CALL_CALLEE_WRAPPERS the unary-wrapped callee
// is no longer recognised as an IIFE, so the inner write doesn't seed a narrow for
// post-call usage and `.at(0)` emits the generic instance polyfill
var x;
(!function () {
  x = "hi";
})();
var first = _at(x).call(x, 0);