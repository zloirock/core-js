import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// The user's iterator property keeps its value and its receiver.
export const direct = {
  [_Symbol$iterator]: null
}[_Symbol$iterator];
export const {
  w: {
    [_Symbol$iterator]: {
      n = 3
    }
  }
} = {
  w: {
    [_Symbol$iterator]: false
  }
};
export function call() {
  const array = [];
  array[_Symbol$iterator] = false;
  return array[_Symbol$iterator]?.();
}
export function readUnknown(value) {
  return _getIteratorMethod(value);
}