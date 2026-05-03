import _Iterator from "@core-js/pure/actual/iterator/constructor";
// VariableDeclarator with conditional init AND rest in pattern: `const {from, ...rest} =
// cond ? Array : Iterator`. fromFallback path goes through tryRegisterPerBranchSynth which
// rejects rest via isSynthSimpleObjectPattern. resolver issues debug warn for the
// destructure key; conditional branches are still rewritten by the global identifier visitor
const {
  from,
  ...rest
} = cond ? Array : _Iterator;
export { from, rest };