import _Array$from from "@core-js/pure/actual/array/from";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
export const from = _Array$from;
export const {
  includes,
  ...rest
} = obj;