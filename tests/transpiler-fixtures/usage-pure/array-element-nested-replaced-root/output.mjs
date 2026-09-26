import _at from "@core-js/pure/actual/instance/at";
// A later element can replace the root binding, but not the value already captured.
export function read() {
  let box = {
    y: {
      at: 1
    }
  };
  const [_ref, _ref2] = [box, box = {
    y: {
      at: 9
    }
  }];
  const at = _at(_ref.y);
  const tail = _ref2;
  return [at, _at(tail.y)];
}