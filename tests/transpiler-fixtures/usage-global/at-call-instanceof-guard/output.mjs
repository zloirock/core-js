import "core-js/modules/es.array.at";
function foo(x) {
  if (x instanceof Array) {
    x.at(-1);
  }
}