import "core-js/modules/es.array.at";
interface Container<T = number[]> {
  items: T;
}
function foo(x: Container) {
  x.items.at(0);
}