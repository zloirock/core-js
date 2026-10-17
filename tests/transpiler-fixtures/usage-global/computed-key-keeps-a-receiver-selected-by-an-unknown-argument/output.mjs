require("core-js/modules/es.array.at");
require("core-js/modules/es.string.at");
// An unknown argument can select either instance family.
// Its receiver is selected before the mapped write in the key and needs a snapshot.
function read(flag) {
  const {
    [(arguments[0] = false, 'at')]: method
  } = flag ? [1] : 'text';
  return [method.call([7], 0), flag];
}
use(read(input));