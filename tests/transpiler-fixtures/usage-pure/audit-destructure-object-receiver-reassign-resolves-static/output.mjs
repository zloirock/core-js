// A container reassigned after destructuring still supplies the earlier value.
// Its literal-wrapper static read remains native.
let w = {
  Arr: Array
};
const {
  Arr: {
    from
  }
} = w;
from([1, 2, 3]);
w = {};