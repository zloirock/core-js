import "core-js/modules/es.object.to-string";
function foo(x) {
  if (typeof x === 'string') {
    x.toString();
  }
}