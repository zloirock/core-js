// `for (obj['at'] of ...)` rebinds `obj.at` each iteration, so the body's `obj['at']()`
// must NOT be polyfilled. memberShapeEqual now compares StringLiteral property values, so
// the write-target structurally matches the read through the computed form
function run(xs) {
  const obj = {};
  for (obj['at'] of xs) {
    obj['at'](0);
  }
}