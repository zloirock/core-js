// A computed-key entry beside a rest element in a parameter destructure: the rest sibling keeps its
// own props while the computed-key entry is body-extracted to the static method
const k = 'of';
function run({ [k]: make, ...rest } = Array) {
  return make([1]) && rest;
}
run();
