import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an install of a dispatching prototype reaches a read of the binding only where it may run before it: a
// read ahead of it in the same frame keeps the initializer's family, so `at` dispatches on arrays alone
const list = [1, 2];
use(_atMaybeArray(list).call(list, 0));
Object.setPrototypeOf(list, String.prototype);