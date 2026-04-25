import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// combination: for-init with nested proxy-global destructure + SequenceExpression head
// + body reads the destructured binding. for-init can't host a lifted SE prefix statement
// outside the loop header, so the polyfill migrates into the default-slot of an
// AssignmentPattern around the destructure, preserving both the SE semantics and the loop
// header shape
function se() {
  return _globalThis;
}
for (const {
  Array: {
    from = _Array$from
  }
} = (se(), _globalThis); false;) from([]);