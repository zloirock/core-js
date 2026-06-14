import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// regression lock: a side-effecting computed key resolving to a static (`[(eff(), "from")]: x`)
// alongside a plain static-flatten sibling (`of: y`) - each extracts its own `const`, the SE-key
// renames to a throwaway with the effect kept in place; no duplicate const, no key-rename SyntaxError
let log = [];
const x = _Array$from;
const y = _Array$of;
const {
  [(_pushMaybeArray(log).call(log, 1), "from")]: _unused
} = Array;
x([1]);
y(2);
export { log };