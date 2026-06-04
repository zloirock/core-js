// a CONDITIONAL nested-block `var` re-declaration does not provably reach the use (the receiver may
// be the declarator-init array or the redeclared string), so the value is indeterminate. the narrow
// degrades to the generic instance helper, sound for either runtime type
function g(c) {
  var x = [];
  if (c) {
    var x = 'hello';
  }
  x.at(-1);
}
