// an inner pattern default (`from = []`) on the mirrored leaf: the synth binds the polyfill
// directly (the user default is dead under the always-defined polyfill), user-object branch kept
const userObj = { Array: {} };
const { Array: { from = [] } } = c ? globalThis : userObj;
from([1]);
