import "core-js/modules/es.string.at";
type Elem<T extends any[]> = T[number];
function foo(x: Elem<string[]>) {
  x.at(0);
}