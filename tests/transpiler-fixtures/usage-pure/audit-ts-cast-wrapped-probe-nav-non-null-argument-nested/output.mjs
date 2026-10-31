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
// @ts-expect-error a realm member the lib does not declare stands for any global the user adds
export const nonNullArgumentNested = _Array$of(_Array$of((null == _globalThis.window ? void 0 : _self.tsBox.inner.n)!));