// a receiver alias's init resolves that receiver in the alias's OWN declaration scope. the use-site
// walk can descend into a nested function, and estree hoists that function's `var` of the receiver
// name to its own scope - invisible from the module-level alias. resolving there would bind the
// alias's receiver to the inner shadow. both cases below carry such a shadow of the receiver name.

// the receiver is `userLibrary` at the declaration, so the static stays native - a pure over-resolve
// would fold to the built-in helper, dropping the user receiver and throwing at runtime
var recvA = userLibrary;
var mapAlias = recvA.Map;
function shadowed() {
  var recvA = globalThis;
  return mapAlias.groupBy([], key => key);
}

// the receiver is the global at the declaration, so the destructured static DOES resolve - the inner
// shadow must not suppress it (a missed rewrite in the other direction)
var recvB = globalThis;
var { Array: arrayAlias } = recvB;
function resolved() {
  var recvB = userLibrary;
  return arrayAlias.fromAsync([]);
}

export { shadowed, resolved };
