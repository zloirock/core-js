import "core-js/modules/es.string.at";
function foo(x) {
  if (!(x instanceof Array)) {
    x.at(-1);
  }
}