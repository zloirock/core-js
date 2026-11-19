import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// The selecting realm's effects run once before its guarded static lookup.
export function read(choice, custom, effect) {
  var _ref2, _ref;
  return null == (_ref = (effect(), choice) ? _globalThis : custom) ? void 0 : (_ref2 = _ref.Object, _ref2 === Object ? _Object$fromEntries([["x", 3]]) : _ref2.fromEntries([["x", 3]]));
}