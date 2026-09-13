import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let log = [];
const {
  from,
  ...rest
} = (_pushMaybeArray(log).call(log, 1), Array);
from([1]);
export { rest, log };