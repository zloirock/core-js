import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A written body can replace its own callable slot with another return family.
function make() {
  this.fn = () => 'abcd';
  return [1];
}
const box = {};
box.fn = make;
box.fn();
use(box.fn().includes('bc'));