import _at from "@core-js/pure/actual/instance/at";
import _Reflect from "@core-js/pure/actual/reflect";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an install of a dispatching prototype through a selection the build leaves open one arm of which is no
// setter runs only where a setter arm does, so a read after it keeps the initializer's family beside the
// installed one and `at` dispatches on both families, while a selection whose every arm is a setter leaves
// `includes` the installed family alone. the `Reflect` read loads its own modules
const O = c ? Object : shim;
const list = [1, 2];
O.setPrototypeOf(list, String.prototype);
use(_at(list).call(list, 0));
const R = c ? Object : _Reflect;
const text = [1, 2];
R.setPrototypeOf(text, String.prototype);
use(_includesMaybeString(text).call(text, 1));