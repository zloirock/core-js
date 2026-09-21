import "core-js/modules/es.array.of";
// Both branches supply the same nested constructor and the selector still evaluates once.
function read({
  value: {
    of
  }
}) {
  return of(1);
}
read(test() ? {
  value: Array
} : {
  value: Array
});