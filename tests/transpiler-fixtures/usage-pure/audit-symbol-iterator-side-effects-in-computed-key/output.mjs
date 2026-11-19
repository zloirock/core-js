import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A computed symbol key carries effects after the receiver has been selected.
// Iterator reads and calls use that unchanged receiver, including argument-call this.
// Optional access skips the key effects when the receiver is nullish.
export const a = (obj, probe(), _getIteratorMethod(obj));
export const b = (obj, probe(), _getIterator(obj));
export const c = (obj, probe(), _getIteratorMethod(obj).call(obj, 42));
export const d = (obj, probe1(), probe2(), _getIteratorMethod(obj));
export const e = obj == null ? void 0 : (probe(), _getIterator(obj));