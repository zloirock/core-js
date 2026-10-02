// Every implementation of the replaced method returns an array.
const box = {
  fn() { return [1]; },
};
box.fn = () => [8, 9];
use(box.fn().at(-1));
