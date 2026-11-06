require("core-js/modules/es.array.at");
// The closed literal caller selects Array before the computed-key write.
// The mapped write still changes the parameter; no String arm reaches the method read.
function read(flag) {
  const {
    [(arguments[0] = false, 'at')]: method
  } = flag ? [1] : 'text';
  return [method.call([7], 0), flag];
}
use(read(true));