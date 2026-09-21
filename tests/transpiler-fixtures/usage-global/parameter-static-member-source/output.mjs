import "core-js/modules/es.array.of";
// A closed caller reads its constructor through a local container slot.
const box = {
  value: Array
};
function read({
  of
}) {
  return of(1);
}
read(box.value);