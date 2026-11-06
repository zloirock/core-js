// A write in a nested function belongs to that binding even when an enclosing
// lookup saw it behind a shadow. Reads must retain the user's replacement.
const local = { from: values => values[0] };
export function nestedWrites(flag) {
  var outer = local;
  outer.from = values => values[0];
  function middle() {
    var held = local;
    held.from = values => values[0];
    function inner() {
      var receiver = flag ? Array : local;
      { const held = { from: () => 0 }; held.from = () => 23; }
      receiver = local;
      return receiver.from([5]);
    }
    return [inner(), held.from([7])];
  }
  return [middle(), outer.from([9]), Array.from([11])];
}
