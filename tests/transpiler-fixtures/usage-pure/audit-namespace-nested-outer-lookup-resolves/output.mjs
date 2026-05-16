import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Inner-namespace use site references OUTER-namespace's local type. lookup-path walk
// from the inner use site climbs through inner TSModuleBlock + outer TSModuleBlock,
// finding LocalArr at the outer body. exercises that the helper checks EVERY enclosing
// TSModuleBlock on the way up, not just the innermost.
namespace A {
  type LocalArr = number[];
  namespace B {
    declare const x: LocalArr;
    _atMaybeArray(x).call(x, 0);
  }
}