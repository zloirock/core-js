import "core-js/modules/es.array.at";
function foo(x: Extract<string | number[] | string[], object>) {
  x.at(0);
}