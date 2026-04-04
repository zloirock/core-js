import "core-js/modules/es.array.at";
function outer<T extends number[]>() {
  function inner(x: T) {
    x.at(-1);
  }
}