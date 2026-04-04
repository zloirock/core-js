import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function foo() {
  this.Array.from([1, 2]).at(0);
}