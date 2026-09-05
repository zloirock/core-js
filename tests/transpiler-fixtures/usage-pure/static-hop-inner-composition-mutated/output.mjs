import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a MUTATED static keeps the user's own value on the raw read: the composition that would bind the
// ponyfill stands down, and the leaf reads through the proxy root's slot the way the source does
Array.of = patched;
const viaHop = _nameMaybeFunction((_ref = _globalThis.Array.of) === void 0 ? {} : _ref);
const {
  of: {
    name: viaMemberInit
  } = {}
} = _globalThis.Array;
export { viaHop, viaMemberInit };