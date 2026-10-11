// an install of a dispatching prototype reaches a read of the binding only where it may run before it: a
// read after it in the same frame takes the installed family alone, so `at` dispatches on strings alone
const list = [1, 2];
Object.setPrototypeOf(list, String.prototype);
use(list.at(0));
