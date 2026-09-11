// reverse order of the mixed case: a nested-block `var` re-declaration FOLLOWED by a recorded `=`
// reassignment. the recorded reassignment is the reaching write, so the receiver narrows to the
// array-specific helper - the redecl does not win just because it was the parser-missed one
function g() {
  var x = [];
  {
    var x = 'hello';
  }
  x = [2];
  x.at(0);
}
