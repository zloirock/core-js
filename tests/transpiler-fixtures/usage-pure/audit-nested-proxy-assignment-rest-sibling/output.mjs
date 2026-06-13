import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// assignment-expression destructure with sibling rest property: outer pattern's `...rest`
// gathers all OTHER own keys, so the proxy-flatten path keeps the rest-binding intact.
// cascade emits `_unused` sentinel + separate polyfill assignment so rest is preserved
// AND polyfill always wins regardless of native receiver field. inner-level rest property
// (`{Array: {from, ...inner}}`) hits the same constraint - sentinel preservation covered
// by both declaration and assignment-expression cascade paths
let from, rest, fromEntries, inner;
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;
var _unused2;
({
  fromEntries: _unused2,
  ...inner
} = _globalThis.Object);
fromEntries = _Object$fromEntries;