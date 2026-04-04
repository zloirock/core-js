import "core-js/modules/es.string.at";
function foo(): `${string}_suffix` {
  return 'hello_suffix';
}
foo().at(-1);