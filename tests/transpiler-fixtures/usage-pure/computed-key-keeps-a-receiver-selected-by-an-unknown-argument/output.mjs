var _at = require("@core-js/pure/actual/instance/at");
// An unknown argument can select either instance family.
// Its receiver is selected before the mapped write in the key and needs a snapshot.
function read(flag) {
  const _ref = flag ? [1] : 'text',
    method = (arguments[0] = false, _at(_ref));
  return [method.call([7], 0), flag];
}
use(read(input));