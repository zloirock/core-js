import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A native-constructor alias written through an UNCONDITIONAL sequence-expression statement (`(0, ({ Array: A } = globalThis))`)
// is trusted, so its static member read folds.
let A;
({
  Array: A
} = _globalThis);
export const viaSeArray = _Array$from([1, 2, 3]);