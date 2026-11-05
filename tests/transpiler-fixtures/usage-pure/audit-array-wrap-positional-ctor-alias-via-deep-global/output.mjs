import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$any from "@core-js/pure/actual/promise/any";
// DEEP array-wrap layers pair positionally too: the global slot folds even when nested two levels
const [[{
  Promise: D
}]] = [[_globalThis]];
export const viaDeepGlobal = _Promise$any([]);