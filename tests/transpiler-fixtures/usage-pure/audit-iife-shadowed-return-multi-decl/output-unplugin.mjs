// IIFE body has multiple `var` declarators; later one shadows global Set. inline-call
// resolution must bail whenever ANY VariableDeclaration appears in the body, not just
// the immediate sibling of return. covers ordering: declarations BEFORE the return
// statement also shadow free identifiers in the return value
'union' in (function () {
  var x = 1;
  var Set = function () {};
  return Set;
})();