import _at from "@core-js/pure/actual/instance/at";
// For-init destructure with single polyfillable instance method and call-expression init.
// Plugin emits comma-separated form inside the for-init rather than a preceding statement.
// Expected: `for (var at = _at(getObj()); cond; step) break;` with no temp memo needed
// (single entry, no rest, no remaining bindings).
for (var at = _at(getObj()); cond; step) break;