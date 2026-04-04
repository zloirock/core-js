import "core-js/modules/es.string.at";
function foo(x) {
  if ('string' === typeof x) {
    x.at(-1);
  }
}