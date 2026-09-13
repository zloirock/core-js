import _Array$from from "@core-js/pure/actual/array/from";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const from = _Array$from;
const {
  at,
  ...rest
} = getArr();
from([1]);
console.log(at, rest);