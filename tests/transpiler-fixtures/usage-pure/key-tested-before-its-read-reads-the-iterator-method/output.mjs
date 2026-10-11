import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a key a test the build decides installs is often tested before it is read (`key && r[key]`): what the
// test reads decides nothing there, and the read after it still sees the write land on every path, so
// it is the iterator method
let andKey;
if (typeof _Symbol != 'undefined') andKey = _Symbol$iterator;
export const andRead = r => andKey && _getIteratorMethod(r);
let ifKey;
if (typeof _Symbol != 'undefined') ifKey = _Symbol$iterator;
export function ifRead(r) {
  if (ifKey && _getIteratorMethod(r)) return _getIteratorMethod(r);
}
let ternaryKey;
if (typeof _Symbol == 'function') ternaryKey = _Symbol$iterator;
export const ternaryRead = r => ternaryKey ? _getIteratorMethod(r) : null;