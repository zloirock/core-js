import "core-js/modules/es.array.at";
function getItems() {
  return [1, 2, 3];
}
function foo(x: ReturnType<typeof getItems>) {
  x.at(-1);
}