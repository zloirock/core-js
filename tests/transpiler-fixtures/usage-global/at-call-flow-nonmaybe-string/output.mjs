import "core-js/modules/es.string.at";
function foo(x: $NonMaybeType<?string>) {
  x.at(-1);
}