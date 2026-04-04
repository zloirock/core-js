import "core-js/modules/es.string.at";
function foo() {
  let x = bar();
  x = baz();
  if (typeof x === 'string') {
    x.at(-1);
  }
}