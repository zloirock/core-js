import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A computed instance key runs after receiver evaluation and before the property read.
// A bodyless control keeps the receiver, key effect, and binding in its one guarded statement.

// bodyless `if`: a static extract - the key effect must run only when `c` is taken
if (c) var _ref = Array,
  f = null == _ref ? _ref[""] : (log(), _Array$from);

// bodyless for-of BODY: an instance method, distinct from above - the for-of/in HEAD bail must not catch the
// body (keying on the node type alone dropped the polyfill, mistaking the body for the head binding)
for (item of items) var _ref2 = rows, m = null == _ref2 ? _ref2[""] : (log(), _flatMaybeArray(_ref2));

// The literal-receiver do-while follows the same ordering on each iteration.
do var _ref3 = [1, 2, 3],
  a = null == _ref3 ? _ref3[""] : (log(), _atMaybeArray(_ref3)); while (c);