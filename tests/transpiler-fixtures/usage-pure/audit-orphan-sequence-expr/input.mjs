// user-written sloppy-mode `_ref = foo()` inside a SequenceExpression at module top-level.
// `USER_ASSIGN_PARENT_TYPES` enumerates common statement positions but omits `SequenceExpression`,
// so this shape could be mis-classified as plugin leftover. Exercising the path to verify
// current behavior stays consistent
import _fill from '@core-js/pure/actual/array/fill';
let result = (_ref = helper(), _ref.x);
[1, 2, 3].at(0);
function helper() { return { x: 42 }; }
console.log(result);
