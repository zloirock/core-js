import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a name a GETTER of the same pattern may rebind (`arr = ...` inside the accessor) is not free to read
// again across the pattern's readers: the value is held once, and every reader reads the one the
// source destructured - a declaration, an assignment over a sequence, a nested slot, symbol keys
let arr = [1, 2];
Object.defineProperty(arr, 'at', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
Object.defineProperty(arr, 'includes', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
Object.defineProperty(arr, 'with', {
  get() {
    arr = 'xy';
    return () => 'own';
  }
});
const _ref = arr;
const a1 = _at(_ref);
const f1 = _flatMaybeArray(_ref);
let a2, f2;
const _ref2 = (eff(), arr);
a2 = _includes(_ref2);
f2 = _flatMapMaybeArray(_ref2);
const _ref3 = arr;
const a3 = _withMaybeArray(_ref3);
const f3 = _findLastMaybeArray(_ref3);
const {
  w: {
    with: _unused,
    findLast: _unused2
  }
} = {
  w: _ref3
};
let list = [1, 2];
_Object$defineProperty(list, _Symbol$iterator, {
  get() {
    list = 'xy';
    return _getIteratorMethod([]);
  }
});
const _ref4 = list;
const it4 = _getIteratorMethod(_ref4);
const {
  [_Symbol$asyncIterator]: ait4
} = _ref4;
use(a1, f1, a2, f2, a3, f3, it4, ait4);