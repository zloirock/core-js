import _Array$from from "@core-js/pure/actual/array/from";
// destructure-default ConditionalExpression with one branch as OptionalMemberExpression:
// `{from} = cond ? Array : globalThis?.Array`. per-branch synth-swap routes through
// `isReplaceableReceiver` AND `isViableBranchForKey` - the babel-plugin's receiver gate
// missed OME, asymmetric with the destructure walker, so the optional-chain branch
// silently bailed even though the chain is structurally classifiable
declare const cond: boolean;
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
f();