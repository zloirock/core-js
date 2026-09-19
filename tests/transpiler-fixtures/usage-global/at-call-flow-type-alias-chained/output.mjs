import "core-js/modules/es.string.at";
type Inner = string;
type Outer = Inner;
function foo(x: Outer) {
  x.at(-1);
}