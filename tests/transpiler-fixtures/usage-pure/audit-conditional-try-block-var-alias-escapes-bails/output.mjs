import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A try block does not prove that its alias assignment ran. Test the stored realm's identity
// before selecting the ponyfill, and keep the original member read as the fallback.
function f() {
  try {
    var M = _globalThis;
  } finally {}
  (M === _globalThis ? _Promise : M.Promise).allSettled([]);
}