import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a chain-assignment buried under the member leaf of a discarded init: rescued WHOLE ahead of
// the extraction - the binding update survives the flatten (it was once silently dropped)
let a;
const from = (a = _globalThis, _Array$from);