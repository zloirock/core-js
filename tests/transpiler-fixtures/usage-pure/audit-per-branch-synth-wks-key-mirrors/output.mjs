import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// per-branch synth-swap with a WKS computed-key sibling: each branch mirrors on its own,
// the plain slot taking that branch's static and the symbol slot the method lookup
// (`_getIteratorMethod(<branch>)` - the one spelling both emitters print for that read
// anywhere else, where a raw `<branch>[_Symbol$iterator]` answers undefined off-engine)
function f({
  [_Symbol$iterator]: it,
  from
} = cond ? {
  [_Symbol$iterator]: _getIteratorMethod(Array),
  from: _Array$from
} : {
  [_Symbol$iterator]: _getIteratorMethod(_Iterator),
  from: _Iterator$from
}) {
  return [it, from];
}
export { f };