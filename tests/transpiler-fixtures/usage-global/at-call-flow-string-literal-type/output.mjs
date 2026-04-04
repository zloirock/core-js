import "core-js/modules/es.string.at";
function greet(x: 'hello' | 'world') {
  return x.at(-1);
}