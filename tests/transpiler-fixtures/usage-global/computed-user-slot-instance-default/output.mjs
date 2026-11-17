import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A user slot default retains its instance receiver.
const userKey = 'userSlotKey';
let at;
({
  self: {
    [userKey]: {
      at
    } = [1, 2]
  }
} = globalThis);
use(at);