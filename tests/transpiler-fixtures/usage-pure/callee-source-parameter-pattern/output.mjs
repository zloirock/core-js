import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-wrapper destructuring stays native; global still supplies the static.
const effects = [];
let r;
const out = [];
(_pushMaybeArray(out) || 0).call(out, (({
  C
}) => C.from([3]))({
  C: Array
}));
r = out;
export { r, effects };