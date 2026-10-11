import _at from "@core-js/pure/actual/instance/at";
// an install of a dispatching prototype reaches a read of the binding only where it may run before it: a
// closure created ahead of it may run after it, so `at` in its body dispatches on both families
const deferred = [1, 2];
use(() => _at(deferred).call(deferred, 0));
Object.setPrototypeOf(deferred, String.prototype);