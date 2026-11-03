import _at from "@core-js/pure/actual/instance/at";
// A local self is the method receiver, not a global alias.
export function read() {
  const self = this;
  const at = _at(self.state.form);
  return at;
}