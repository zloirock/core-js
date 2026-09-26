import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A proven symbol alias shares the array plan with a named instance read.
const key = _Symbol$iterator;
export function read(receiver) {
  const iterator = _getIteratorMethod(receiver);
  const at = _at(receiver);
  return [iterator, at];
}