// A capture belongs to one invocation; a later call may capture another receiver family.
// Rebinding after the capture cannot change the saved value of the current invocation.
let value = [0, 2];
function read() {
  const [saved] = [value];
  value = '02';
  return [saved.at(-1), saved.includes('02')];
}
use(read(), read());
