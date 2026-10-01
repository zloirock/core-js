import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A capture belongs to one invocation; a later call may capture another receiver family.
// Rebinding after the capture cannot change the saved value of the current invocation.
let value = [0, 2];
function read() {
  const [saved] = [value];
  value = '02';
  return [_at(saved).call(saved, -1), _includes(saved).call(saved, '02')];
}
use(read(), read());