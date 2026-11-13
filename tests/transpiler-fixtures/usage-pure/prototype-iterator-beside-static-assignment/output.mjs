import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A prototype iterator beside a static is served without losing its assignment target.
let from, iterator;
({
  Array: {
    from,
    prototype: {
      [_Symbol$iterator]: iterator
    }
  }
} = {
  Array: {
    from: _Array$from,
    prototype: {
      get [_Symbol$iterator]() {
        return _getIteratorMethod(_globalThis.Array.prototype);
      }
    }
  }
});
export { from, iterator };