import _Object$keys from "@core-js/pure/actual/object/keys";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const src = {
  o: Object
};
const k = _Object$keys;
const {
  o: {
    "keys": _unused,
    ...rest
  }
} = src;
export { k, rest };