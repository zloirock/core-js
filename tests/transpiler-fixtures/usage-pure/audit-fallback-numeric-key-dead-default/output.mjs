import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// choosing between an IIFE argument and a polyfill-DEAD default needs every destructured key name.
// resolving those names by spelling out node types made the answer depend on the PARSER - a numeric
// key is `NumericLiteral` under one and a plain literal under the other - so one emitter kept the
// dead default and dropped the polyfill while the other superseded it. the numeric key itself is
// never polyfillable; it only has to stop the enumeration from bailing
const withNumericKey = function ({
  0: z,
  entries: e
} = Math) {
  return [z, e];
}({
  "0": _globalThis.Object["0"],
  entries: _Object$entries
});
// the same shape with only string-named keys, which never depended on the parser
const withNamesOnly = function ({
  values: v
} = Math) {
  return v;
}({
  values: _Object$values
});
// a numeric key alongside a string-spelled one resolves through the same channel
const withNumericAndString = function ({
  1: n,
  'keys': k
} = Math) {
  return [n, k];
}({
  "1": _globalThis.Object["1"],
  "keys": _Object$keys
});
export { withNumericKey, withNamesOnly, withNumericAndString };