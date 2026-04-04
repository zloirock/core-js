type Items = number[];
function outer() {
  function inner(x: Items) {
    x.at(-1);
  }
}
