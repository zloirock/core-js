import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
const [[viaNestedRead]] = [...[[[1]]]];
_flatMapMaybeArray(viaNestedRead).call(viaNestedRead, x => x);
export { viaNestedRead };