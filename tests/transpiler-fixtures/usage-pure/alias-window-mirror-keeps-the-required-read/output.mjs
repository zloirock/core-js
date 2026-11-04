import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// An immutable alias can hold an absent window on either pass.
const w = _globalThis.window;
let from;
({
  Array: {
    from
  }
} = (w.globalThis, {
  Array: {
    from: _Array$from
  }
}));
export { from };