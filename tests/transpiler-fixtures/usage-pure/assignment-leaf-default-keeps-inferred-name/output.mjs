import _at from "@core-js/pure/actual/instance/at";
// An anonymous function default of an assignment leaf the dispatch may replace keeps the name the
// binding gives it natively (`fallback`): the guard that falls back to it still names it after the
// binding, as the declaration host does, over a receiver no type is known for.
let fallback;
function pickFallback(foreign) {
  var _ref;
  fallback = (_ref = _at(foreign.y)) === void 0 ? {
    "fallback": () => -1
  }["fallback"] : _ref;
}
export { fallback, pickFallback };