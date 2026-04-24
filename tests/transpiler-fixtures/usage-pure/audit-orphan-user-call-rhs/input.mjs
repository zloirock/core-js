// user-written sloppy-mode `_ref = foo()` at module top-level with user's own
// core-js pure import. if the post-pass orphan heuristic mis-classifies this as
// plugin leftover, it would add `var _ref;` above it (adopting the user's binding).
// `isPluginShapedOrphanAssign` considers parentType = ExpressionStatement a user shape,
// so the orphan is rejected regardless of RHS type
import _fill from '@core-js/pure/actual/array/fill';
_ref = helper();
[1, 2, 3].at(0);
function helper() { return 42; }
