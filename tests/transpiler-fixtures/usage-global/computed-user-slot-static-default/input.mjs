// A user slot default retains its constructor and the selected static.
const userKey = 'userSlotKey';
let groupBy;
({ self: { [userKey]: { groupBy } = Map } } = globalThis);
use(groupBy);
