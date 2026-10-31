import _Map from "@core-js/pure/actual/map/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// @ts-expect-error a constructor called without new and a delete tsc refuses are the shape under test
_Map();
delete obj.at!;
const {
  includes,
  ...rest
} = obj;