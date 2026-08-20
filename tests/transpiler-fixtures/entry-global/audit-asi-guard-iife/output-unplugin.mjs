import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Removing the entry import must not fuse the `(` of the next IIFE-like line onto the
// previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because the prev
// statement ended without semicolon AND the user did not prepend their own guard.
var x = 1
;(function () { x(); })()