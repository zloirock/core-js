import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Multi-level proxy-global chain via const-bound ObjectExpression hops: `ns.a.b` resolves
// to `globalThis`, then walkPath continues with `Array`. Exercises walkStaticReceiverStep's
// recursive descent + the post-loop proxy-global lift simultaneously. Without the lift,
// the inner `globalThis` Identifier at depth=2 would bail (Identifier !== ObjectExpression
// AND walkPath non-empty), missing `from` polyfill emission silently
const ns = {
  a: {
    b: _globalThis
  }
};
const from = _Array$from;
export const arr = from([1, 2, 3]);