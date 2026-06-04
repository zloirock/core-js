import _Array$of from "@core-js/pure/actual/array/of";
// A computed-key entry beside a rest element in a parameter destructure: the rest sibling keeps its
// own props while the computed-key entry is body-extracted to the static method
const k = 'of';
function run({
  [k]: _unused,
  ...rest
} = Array) {
  let make = _Array$of;
  return make([1]) && rest;
}
run();