import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A selected Object constructor uses its static; a custom receiver retains its own method.
export function read(choice, custom) {
  var _ref, _ref2;
  return null == (_ref = choice ? Object : custom) ? void 0 : _at(_ref2 = (_ref === Object ? _Object$entries : _entries(_ref).bind(_ref))({
    x: 3
  })).call(_ref2, 0);
}