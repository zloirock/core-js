import _Array$from from "@core-js/pure/actual/array/from";
// Bare assignment destructure `({ from } = Array)`: isAssignment=true branch, requires
// outer parens to stay ExpressionStatement. `initSrc` is `.right`, emitted as
// `from = _Array$from`. No `const`/`let` prefix.
let from;
from = _Array$from;
from;