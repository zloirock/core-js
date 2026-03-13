import "core-js/modules/es.string.at";
function foo(x: Exclude<string | number[] | string[], object>) {
  x.at(0);
}