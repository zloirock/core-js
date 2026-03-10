import "core-js/modules/es.array.at";
function outer(x: number[]) {
  function inner() {
    x.at(-1);
  }
}