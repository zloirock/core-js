import "core-js/modules/es.string.at";
type MyUnion = string | number;
function foo(x: Extract<MyUnion, string>) {
  x.at(-1);
}