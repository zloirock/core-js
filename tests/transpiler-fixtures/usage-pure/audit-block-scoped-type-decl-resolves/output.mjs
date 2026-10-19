import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Block-scoped type alias declared inside a BlockStatement (also TSModuleBlock / StaticBlock,
// whose statement list is the body itself, not body.body). the scope walker must find LocalArr
// in that block; otherwise x falls through to generic dispatch and `.at(0)` emits the broader
// receiver helper instead of the Array-specific one.
function probe() {
  {
    type LocalArr = number[];
    // @ts-expect-error a declaration inside a body, which tsc refuses, gives the row a value of a local type
    declare const x: LocalArr;
    _atMaybeArray(x).call(x, 0);
  }
}