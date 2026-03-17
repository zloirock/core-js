import "core-js/modules/es.string.at";
function foo() {
  let x = bar();
  if (typeof x !== 'string') return;
  x.at(0), x = baz();
}