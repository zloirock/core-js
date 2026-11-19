import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$create from "@core-js/pure/actual/object/create";
import _Set from "@core-js/pure/actual/set/constructor";
// duplicate symbol leaves consume into TWO synth assigns in source order
let dupA, dupB;
dupA = _getIteratorMethod(_Set);
dupB = _getIteratorMethod(_Set);
export const crt = _Object$create;
export const r = [dupA, dupB, crt];