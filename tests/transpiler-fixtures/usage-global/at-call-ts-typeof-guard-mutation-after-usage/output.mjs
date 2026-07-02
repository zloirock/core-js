import "core-js/modules/es.string.at";
import "core-js/modules/es.string.bold";
function test(x: string | number[]) {
  if (typeof x === 'string') {
    x.at(0).bold();
    x = ['reassigned'];
  }
}