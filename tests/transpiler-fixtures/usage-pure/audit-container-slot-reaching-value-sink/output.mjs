import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// an escaped container bails via the wildcard too
const ce = {
  e: Object
};
export function sink(x) {
  return x;
}
sink(ce);
const {
    e: _ref
  } = ce,
  escapedLiteralOnly = _ref === Object ? _Object$entries : _entries(_ref);
export { escapedLiteralOnly };