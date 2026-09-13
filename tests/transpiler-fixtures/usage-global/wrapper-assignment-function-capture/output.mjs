import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A called function installs a wrapper with its local alias into an outer binding.
// The later nested write follows that capture back to the original container.
const original = {
  x: Array
};
let alias = {
  x: Object
};
function install() {
  const local = original;
  alias = {
    box: local
  };
}
install();
alias.box.x = {
  from: () => 'custom'
};
original.x.from([1]);