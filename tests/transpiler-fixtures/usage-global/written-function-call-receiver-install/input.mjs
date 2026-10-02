// A written body can replace its own callable slot with another return family.
function make() {
  this.fn = () => 'abcd';
  return [1];
}
const box = {};
box.fn = make;
box.fn();
use(box.fn().includes('bc'));
