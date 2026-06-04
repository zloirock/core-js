import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
const _ref = _globalThis.navigator;
// A flatten-declaration sibling extracting two instance methods off one global-member receiver: the
// proxy-global root is substituted (no bare globalThis leak) and the receiver memoized into a single
// `_ref` so the substituted member chain is evaluated once, not once per extracted method
const values = _values(_ref);
const keys = _keys(_ref);
const from = _Array$from;
from([1]);
console.log(values, keys);