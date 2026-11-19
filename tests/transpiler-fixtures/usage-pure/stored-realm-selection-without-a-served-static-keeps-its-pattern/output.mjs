import _globalThis from "@core-js/pure/actual/global-this";
// A stored realm selection under a nested level that reads no served static keeps its pattern and its store
// whole.
let f4, held;
const shim = {};
({
  Array: {
    isArray: f4
  }
} = held = c ? _globalThis : shim);