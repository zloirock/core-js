import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a REPEATED aliasing write is no registered alias - the pristine-tree judgment refuses the
// multi-write set - while the write reaching the read still names the key, so the read takes
// the iterator method on both emitters
let twice;
twice = _Symbol$iterator;
twice = _Symbol$iterator;
export const viaDoubleAssign = _getIteratorMethod([]);