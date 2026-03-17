import "core-js/modules/es.string.at";
opaque type Name = string;
function foo(x: Name) {
  x.at(-1);
}