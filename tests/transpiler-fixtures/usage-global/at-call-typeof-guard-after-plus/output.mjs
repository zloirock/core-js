import "core-js/modules/es.string.at";
function foo(a, b) {
  const y = a + b;
  if (typeof y === 'string') {
    y.at(0);
  }
}