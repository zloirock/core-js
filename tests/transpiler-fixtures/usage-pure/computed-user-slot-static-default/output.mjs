import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A user slot default retains its constructor and the selected static.
const userKey = 'userSlotKey';
let groupBy;
({
  [userKey]: {
    groupBy
  } = {
    groupBy: _Map$groupBy
  }
} = _globalThis);
use(groupBy);