import "core-js/modules/es.array.at";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.string.includes";
function foo(): [string, string] {
  return ['a', 'b'];
}
foo().sort().at(0).includes('x');