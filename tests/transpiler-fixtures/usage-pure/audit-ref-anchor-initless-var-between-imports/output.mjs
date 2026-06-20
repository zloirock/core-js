import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an initless `var` sitting BETWEEN two top-level imports must not truncate the import region: it is
// runtime-hoisted regardless of position, so the memoize `var _ref;` anchor steps past it and lands
// after the LAST import, not between the two user imports (which would violate lint `import/first`).
// the single receiver-memoized instance call produces the `_ref` whose placement this pins
import "x";
var sentinel;
import "y";
var _ref;
const r = _atMaybeString(_ref = "z").call(_ref, -1);