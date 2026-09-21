import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A symbol slot passes through beside a nested static in a branch mirror.
// The foreign ternary arm stays native, and a falsy logical arm still yields its own value.
const {
  [_Symbol$iterator]: it,
  Array: {
    from: f
  }
} = c ? {
  [_Symbol$iterator]: _getIteratorMethod(_globalThis),
  Array: {
    from: _Array$from
  }
} : userObj;
it;
f(x);
const {
  [_Symbol$iterator]: it2,
  Object: {
    fromEntries: fe = fb
  }
} = c && {
  [_Symbol$iterator]: _getIteratorMethod(_globalThis),
  Object: {
    fromEntries: _Object$fromEntries
  }
};
it2;
fe(y);