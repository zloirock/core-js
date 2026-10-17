import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
function viaFn(x) {
  switch (x) {
    case 1:
      function WeakSet() {}
      return WeakSet;
  }
  return new _WeakSet([]);
}
export { viaFn };