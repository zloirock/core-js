import "core-js/modules/es.array.at";
function foo(x: [string, number[]][1]) {
  x.at(-1);
}