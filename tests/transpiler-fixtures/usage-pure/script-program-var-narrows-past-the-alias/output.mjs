var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _Object$entries = require("@core-js/pure/actual/object/entries");
// a script's program-level `var` aliases the global property, so a read before the declarator's
// assignment is a real global read - and the TYPE that read yields has to survive the same way.
// the array `Object.entries` returns still selects the array-specific `at`, not the generic
// fallback the resolver falls back to when it believes the name is shadowed.
var first = _Object$entries({
  a: 1
})[0];
_atMaybeArray(first).call(first, 0);
var Object = 1;