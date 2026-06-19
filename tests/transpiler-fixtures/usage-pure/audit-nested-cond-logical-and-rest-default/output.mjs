import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `guard && globalThis`: the `&&` short-circuits to its RIGHT operand as the only value branch - a
// falsy guard makes native destructure off the falsy primitive and THROW (the intermediate `.Array`
// hop reads `undefined`, then destructuring `undefined` throws), so it never yields a user object
// carrying a legitimate `undefined`. every reachable value branch is therefore the global proxy, and
// the inner rest - though un-mirrorable - can safely take a per-branch default: it fires only on the
// truthy proxy selection, never on a corruptible user `undefined`. contrast the ternary+rest sibling,
// whose user-object alternate forces a native bail
const guard = 1;
const {
  Array: {
    from = _Array$from,
    ...rest
  }
} = guard && _globalThis;
typeof from;