import "core-js/modules/es.string.at";
function foo(x) {
  if (typeof x !== 'object') {
    x.at(-1);
  }
}