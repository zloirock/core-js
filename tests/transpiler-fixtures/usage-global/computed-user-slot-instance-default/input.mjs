// A user slot default retains its instance receiver.
const userKey = 'userSlotKey';
let at;
({ self: { [userKey]: { at } = [1, 2] } } = globalThis);
use(at);
