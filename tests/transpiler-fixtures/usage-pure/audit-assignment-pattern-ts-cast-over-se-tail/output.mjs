import _Array$from from "@core-js/pure/actual/array/from";
// AssignmentPattern default with TS cast wrapping the SE-tail receiver:
//   ({from} = (logCall(), Array) as any)
// `unwrapSafeSequenceTail` peels TS wrappers between SE-levels via `unwrapRuntimeExpr`;
// synth-swap should still mutate only the inner Identifier and keep the SE prefix intact
declare function logCall(): void;
function probe({
  from
} = (logCall(), {
  from: _Array$from
}) as any) {
  return from([1]);
}
export { probe };