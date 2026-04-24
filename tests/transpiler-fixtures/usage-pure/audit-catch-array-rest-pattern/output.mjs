import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Catch's ArrayPattern with nested default and rest - no extraction: positional bindings
// can't benefit from property-rewrite, so babel mirrors unplugin and leaves the pattern
// inline. `.at` / `.flat` polyfill against the named locals unchanged
try {} catch ([a = {
  inner: 42
}, ...rest]) {
  _at(a).call(a, 0);
  _flatMaybeArray(rest).call(rest);
}