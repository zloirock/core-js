import "core-js/modules/es.string.at";
function foo(x: 'a' | 'b') {
  x.at(-1);
}