// A conditional write or parameter can supply a constructor key at runtime.
// Those keys keep whole-family global coverage.
let key;
if (flag) key = "from";
use(Array[key]);
function f(key) {
  return Object[key];
}
use(f);
