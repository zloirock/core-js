import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// Negative: chain bottoms out on a USER-DEFINED `Array` (local ObjectExpression literal,
// not the real Array constructor). `proxyGlobalNameOf` returns null for this inner hop,
// so the lift doesn't fire. `from` stays a regular runtime destructure binding pointing at
// the user's arrow function. Guards against over-eager flattening that would replace the
// user's logic with the Array.from polyfill
const ns = {
  root: {
    Array: {
      from: x => _sliceMaybeArray(x).call(x, 0)
    }
  }
};
const {
  root: {
    Array: {
      from
    }
  }
} = ns;
export const arr = from([1, 2, 3]);