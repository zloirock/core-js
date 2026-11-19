import _Object$keys from "@core-js/pure/actual/object/keys";
// A computed alias for a constructor slot keeps its key effect inside the pattern.
const src = {
  O: Object,
  A: Array
};
let gate = 1;
let se = 0;
let keys, from, dotted;
src;
({
  [(se += 1, 'O')]: {}
} = src);
keys = _Object$keys;
export { keys, from, dotted, se };