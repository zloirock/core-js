import _Array$from2 from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// distinct static-method polyfills with overlapping prefix shape would collide on the
// hint-prefix slot if uniqueName were not consulted per allocation. each entry must land
// on its own binding via skip-1 + suffix increment
const _Array$from = "user-shadow";
const x = _Array$from2([1]);
const y = _Array$of(2, 3);