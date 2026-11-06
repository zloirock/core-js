import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A local object's same-named slot can be missing; its default stays live.
export function read(self) {
  const {
    w: {
      at
    } = {
      at: _atMaybeArray([11])
    }
  } = {
    w: self.self
  };
  return at;
}