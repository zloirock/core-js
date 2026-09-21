import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Static and symbol-iterator claims share the same selected realm.
// Each keeps its own pure value and any rest exclusions.
const {
  [_Symbol$iterator]: it,
  ...r
} = c ? _globalThis : _self;
it;
r;
const {
  [_Symbol$iterator]: it2,
  Array: {
    from: f
  }
} = {
  [_Symbol$iterator]: _getIteratorMethod(_globalThis),
  Array: {
    from: _Array$from
  }
};
it2;
f(x);