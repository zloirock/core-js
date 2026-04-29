// user-written sloppy-mode `_ref = foo()` inside a comma expression at module top-level.
// The user-assignment classifier enumerates common statement positions for the assignment
// parent but a comma expression is not one of them, so this shape could otherwise be
// mistaken for plugin leftover. Exercises the path to lock in current behavior.
import _fill from '@core-js/pure/actual/array/fill';
let result = (_ref = helper(), _ref.x);
[1, 2, 3].at(0);
function helper() { return { x: 42 }; }
console.log(result);
