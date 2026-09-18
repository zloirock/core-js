import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// The parameter-default form of that same fold, which is a different host from the declarator one:
// the [Set] computed key is a bare global this pass substitutes, so per-branch synth spells the
// binding it is rewritten to and both `from` reads get their ponyfill.
const cond = true;
function pick({
  from,
  [_Set]: ctor
} = cond ? {
  from: _Array$from,
  [_Set]: Array[_Set]
} : {
  from: _Iterator$from,
  [_Set]: _Iterator[_Set]
}) {
  return [from, ctor];
}
pick();