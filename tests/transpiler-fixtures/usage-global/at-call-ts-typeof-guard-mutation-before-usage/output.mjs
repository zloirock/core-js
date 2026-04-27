import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
function test(x: string | number[]) {
  if (typeof x === 'string') {
    x = ['reassigned'];
    x.at(0).includes('a');
  }
}