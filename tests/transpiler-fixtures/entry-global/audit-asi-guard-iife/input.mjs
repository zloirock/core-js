// Removing the entry import must not fuse the `(` of the next IIFE-like line onto the
// previous `var x = 1` expression - guardAsiAtBoundary must inject `;` because the prev
// statement ended without semicolon AND the user did not prepend their own guard.
var x = 1
import 'core-js/actual/array/from'
(function () { x(); })()
