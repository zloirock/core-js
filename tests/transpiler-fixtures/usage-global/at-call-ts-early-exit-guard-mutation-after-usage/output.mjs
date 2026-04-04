import "core-js/modules/es.string.at";
import "core-js/modules/es.string.fontcolor";
function test(x: string | number[]) {
  if (typeof x !== 'string') return;
  x.at(0).fontcolor('red');
  x = ['reassigned'];
}