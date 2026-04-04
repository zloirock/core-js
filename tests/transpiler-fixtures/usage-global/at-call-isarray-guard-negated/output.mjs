import "core-js/modules/es.string.at";
function foo(x) {
  if (!Array.isArray(x)) {
    x.at(-1);
  }
}