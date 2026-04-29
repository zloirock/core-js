// `for (obj['at'] of ...)` rebinds `obj.at` each iteration: the loop body's `obj['at']()`
// reads whatever the user assigned, so it must not be polyfilled. shape-comparison treats
// the StringLiteral computed form as equivalent to the dot-access write target
function run(xs) {
  const obj = {};
  for (obj['at'] of xs) {
    obj['at'](0);
  }
}