import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// a bare-global computed key (`[Set]` - no in-scope binding) in a DECLARED function's param-default
// pattern is spelled in the synth literal as the PURE BINDING this pass rewrites it to, never as the
// raw name an ie:11 ReferenceError would come from - so the literal stands and the pattern stays
// caller-correct by construction, where the body-extract it took before was sound only while every
// local call kept the default. EVERY prop of the pattern reads that literal, whatever side of the
// key it sits on: the gate that admits the literal is asked about the key this pass has already
// rewritten, so the props dispatched after that rewrite get the same answer as the ones before it.
function f({
  from,
  [_Set]: y,
  of
} = {
  from: _Array$from,
  [_Set]: Array[_Set],
  of: _Array$of
}) {
  return [from, of, y];
}
f();