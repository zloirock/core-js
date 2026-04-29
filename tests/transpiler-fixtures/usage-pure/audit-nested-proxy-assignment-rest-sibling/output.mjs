import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// AssignmentExpression destructure with sibling RestElement: outer pattern's `...rest`
// gathers all OTHER own keys, so silently dropping the proxy-flatten path would lose
// rest-binding. cascade emits `_unused` sentinel + separate polyfill assignment so rest
// is preserved AND polyfill always wins regardless of native receiver field. inner-level
// RestElement (`{Array: {from, ...inner}}`) hits the same constraint - sentinel preservation
// covered by both VariableDeclaration and AssignmentExpression cascade paths
let from, rest, fromEntries, inner;
var _unused;
({
  Array: _unused,
  ...rest
} = _globalThis);
from = _Array$from;
var _unused2;
({
  Object: {
    fromEntries: _unused2,
    ...inner
  }
} = _globalThis);
fromEntries = _Object$fromEntries;