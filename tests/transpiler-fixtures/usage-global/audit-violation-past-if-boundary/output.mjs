import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
let x = [1, 2, 3];
if (Math.random()) {
  x = 'hello';
}
x.at(0);