var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
// The closed literal caller selects Array before the computed-key write.
// The mapped write still changes the parameter; no String arm reaches the method read.
function read(flag) {
  const method = (arguments[0] = false, _atMaybeArray([1]));
  return [method.call([7], 0), flag];
}
use(read(true));