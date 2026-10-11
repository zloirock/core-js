import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an install of a dispatching prototype that may not run before a read - under a condition, behind an
// `&&` - leaves the read the family the initializer built beside the installed one: pure dispatches over
// both, usage-global loads both. distinct method per line
const maybe = [1, 2];
if (flag) Object.setPrototypeOf(maybe, String.prototype);
use(_at(maybe).call(maybe, 0));
const either = [1, 2];
flag && (either.__proto__ = String.prototype);
use(_includes(either).call(either, 1));