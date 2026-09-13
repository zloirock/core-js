import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A wrapper retains the local alias captured by its assigned literal after the block ends.
// A later write through the wrapper reaches the original and preserves the custom method.
const original = {
  x: Array
};
let alias = {
  x: Object
};
{
  const local = original;
  alias = {
    box: local
  };
}
alias.box.x = {
  from: () => 'custom'
};
original.x.from([1]);