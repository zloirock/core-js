// a nested-block `var` re-declaration overwrites the function-scoped binding before the use, so the
// declarator-init array type is stale: the receiver is a string at the use. the reaching
// re-declaration's value flows to the use, narrowing to the string-specific helper (not the stale
// `_atMaybeArray`, a cross-type Maybe that would throw on the string receiver under ie:11)
function g() {
  var x = [];
  {
    var x = 'hello';
  }
  x.at(-1);
}
