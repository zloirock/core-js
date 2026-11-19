// A mutating forwarder contributes only constructors present in its known sources.
// Its custom receiver's of method must not imply Array or typed-array statics.
function forward(box) {
  box.other = 1;
  return box;
}
forward({
  value: {
    of: values => values
  }
}).value.of([2]);