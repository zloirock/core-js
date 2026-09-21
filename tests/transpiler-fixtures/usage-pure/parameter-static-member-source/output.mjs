import _Array$of from "@core-js/pure/actual/array/of";
// A closed caller reads its constructor through a local container slot.
const box = {
  value: Array
};
function read({
  of
}) {
  return of(1);
}
read({
  of: _Array$of
});