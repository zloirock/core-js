import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// A stored selection between the realm and the user's object reached through the realm's proxies - a `self`
// or a `window` arm, a `self` hop in the pattern - holds the constructor on its realm arm alone: the nested
// static reads the captured hop through the identity guard, the proxy hops staying as written.
let held, from, of, fromEntries;
({
  Array: _ref
} = held = c ? _self : shim), from = _ref === Array ? _Array$from : _ref.from;
({
  self: {
    Array: _ref2
  }
} = held = c ? _globalThis : shim), of = _ref2 === Array ? _Array$of : _ref2.of;
({
  Object: _ref3
} = held = c ? window : shim), fromEntries = _ref3 === Object ? _Object$fromEntries : _ref3.fromEntries;
export { held, from, of, fromEntries };