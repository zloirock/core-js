// a nested-block `var` re-declaration that sits AFTER the use does not reach it, so the declarator
// init still describes the receiver - it narrows to the array-specific helper
function g() {
  var x = [1];
  x.at(0);
  {
    var x = 'late';
  }
}
