import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a receiver-shaped inner default in an array wrapper resolves its right as the receiver ONLY when the
// paired array slot is STATICALLY undefined (then the default provably fires): a bare `undefined`
// (`[{ from } = Array] = [undefined]`) or a pure `void 0` (`[{ fromEntries } = Object] = [void 0]`) makes
// the leaf a static of the receiver -> polyfilled, not left native (which throws off-engine). a DEFINED
// slot keeps the native element receiver: `[{ of } = Array] = [obj]` -> `of` is `obj.of`, left native.
// both the identification and the flatten plan resolve the same slot through one shared predicate, so
// the two emitters stay consistent
const from = _Array$from;
const obj = {
  of: x => [x]
};
const [{
  of
} = Array] = [obj];
const fromEntries = _Object$fromEntries;
export const a = from([1, 2, 3]);
export const b = of(5);
export const c = fromEntries([['k', 1]]);