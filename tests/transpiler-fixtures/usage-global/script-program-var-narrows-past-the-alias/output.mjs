require("core-js/modules/es.object.entries");
require("core-js/modules/es.array.at");
// a script's program-level `var` aliases the global property, so a read before the declarator's
// assignment is a real global read - and the TYPE that read yields has to survive the same way.
// the array `Object.entries` returns still selects the array-specific `at`, not the generic
// fallback the resolver falls back to when it believes the name is shadowed.
var first = Object.entries({
  a: 1
})[0];
first.at(0);
var Object = 1;