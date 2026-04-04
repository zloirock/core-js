import "core-js/modules/es.array.at";
type Items = number[];
function outer() {
  function inner(x: Items) {
    x.at(-1);
  }
}