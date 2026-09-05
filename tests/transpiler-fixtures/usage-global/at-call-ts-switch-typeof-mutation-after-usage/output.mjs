import "core-js/modules/es.string.at";
import "core-js/modules/es.string.strike";
function test(x: string | number[]) {
  switch (typeof x) {
    case 'string':
      x.at(0).strike();
      x = ['reassigned'];
      break;
  }
}