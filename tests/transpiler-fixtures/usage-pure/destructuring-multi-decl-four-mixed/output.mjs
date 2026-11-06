import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const from = _Array$from;
const resolve = _Promise$resolve;
const x = 1;
const {
  includes,
  ...rest
} = obj;