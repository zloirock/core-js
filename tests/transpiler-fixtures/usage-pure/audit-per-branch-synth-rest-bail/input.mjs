// per-branch synth-swap with a rest sibling: `{from, ...rest} = cond ? A : B`. the rest
// element prevents reshaping the pattern (would lose runtime exclusion semantics), so
// per-branch synth bails. plain identifiers in branches still polyfill independently
function f({ from, ...rest } = cond ? Array : Iterator) {
  return [from, rest];
}
export { f };
