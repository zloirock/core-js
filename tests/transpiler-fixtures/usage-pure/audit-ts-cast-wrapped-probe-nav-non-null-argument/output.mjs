import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a TS cast layer sits BETWEEN the probe nav and its tail. the cast is type-only: the guard
// renders exactly as in the bare spelling, the collapse still fires, and the cast layer rides
// the rendered value (it erases downstream)
_globalThis.tsBox = {
  n: 4,
  inner: {
    n: 5
  },
  list: ['ab', 'cd']
};
// a TS layer on the claim sitting in a call ARGUMENT: the guard belongs in the argument, never over
// the call the source wrote. the erased operator's side of that guard is where the emitters part -
// `!` and a cast both vanish at emit, so the two spellings compile to the same JS
export const nonNullArgument = _Array$of((null == _globalThis.window ? void 0 : _self.tsBox.n)!);