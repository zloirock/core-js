import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo() {
  let x = bar();
  typeof x === 'string' && (x = baz(), x.at(-1));
}