// intersection of two collapse behaviors: a `||` fallback receiver whose left has a POLYFILLABLE
// instance-method prefix (`[1].at(0)`) AND an UNRESOLVED sibling key (`isArray`). the receiver is
// memoized (the prefix runs once inside the memo argument and is itself polyfilled), the unresolved
// sibling reads the memo, and the dead right operand is dropped - no double-eval, import set minimal
function g({ from, isArray } = ([1].at(0), Array) || Set) {
  return [from([1]), isArray([])];
}
g();
