import "core-js/modules/es.string.at";
function foo(x: Extract<string | number[], string>) {
  x.at(-1);
}