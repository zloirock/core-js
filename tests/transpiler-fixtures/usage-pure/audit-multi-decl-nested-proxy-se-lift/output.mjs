import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// multi-declarator nested-proxy destructure with comma-expression init in the first
// declarator. flatten lifts the side-effect prefix as a standalone statement (the comma-tail
// `globalThis` becomes the dropped receiver), then emits `const from = _Array$from` for
// the extracted polyfill key, then preserves the sibling `x = 1` declarator. The lift keeps
// the `se()` side-effect observable alongside the spliced-out original
let traced = 0;
function se() {
  traced++;
  return _globalThis;
}
se();
const from = _Array$from;
const x = 1;
from([1, 2, 3]);
console.log(x, traced);