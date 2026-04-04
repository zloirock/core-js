import "core-js/modules/es.string.at";
function foo() {
  let x = bar();
  if (typeof x !== 'string') {
    x = baz();
    return;
  }
  x.at(-1);
}