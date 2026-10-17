import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// NEGATIVE: a same-named UNBOUND read outside the alias's hosting scope is a runtime
// ReferenceError - the file-wide name-keyed registration must not serve it
function scopedAlias() {
  const scopedIt = _Symbol$iterator;
  return _getIteratorMethod([]);
}
export const viaScoped = scopedAlias();