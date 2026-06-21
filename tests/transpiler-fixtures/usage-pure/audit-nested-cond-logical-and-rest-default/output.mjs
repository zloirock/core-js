import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `guard && globalThis`: the `&&` yields its RIGHT operand as the only value branch - a falsy
// guard destructures off the falsy primitive and THROWS, never yielding a user object with a
// legitimate `undefined`. so every reachable value branch is the global proxy, and the inner
// rest can safely take a per-branch default. contrast ternary+rest, whose user alternate bails
const guard = 1;
const {
  Array: {
    from = _Array$from,
    ...rest
  }
} = guard && _globalThis;
typeof from;