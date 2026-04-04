import "core-js/modules/es.array.at";
function foo(x) {
  if (Array.isArray(x)) {
    x.at(-1);
  }
}