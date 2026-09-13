import _Map from "@core-js/pure/actual/map/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
_Map();
delete obj.at!;
const {
  includes,
  ...rest
} = obj;