// The rest copy runs before the following constructor binding is initialized.
// Its getter observes TDZ even when an earlier static is extracted.
function observe() { try { note(typeof W); } catch (error) { note(error.name); } return 7; }
Object.defineProperty(Number, 'orderProbe', { enumerable: true, get: observe });
const { Number: { isInteger, ...numbers }, WeakMap: W } = (note('prefix'), globalThis);
use(isInteger, numbers, W);
