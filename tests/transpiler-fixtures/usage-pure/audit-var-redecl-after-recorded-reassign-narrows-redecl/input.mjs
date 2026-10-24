// mixed reassignment shapes: a recorded `=` reassignment AND a later nested-block `var` re-declaration
// the parser never records. the redecl is the reaching write, so the receiver narrows to its
// string-specific helper - not the stale array of the recorded reassignment (a cross-type Maybe that
// would throw on the string receiver under ie:11)
function g() {
  var x = [];
  x = [2];
  {
    var x = 'hello';
  }
  x.at(0);
}
