// A local self is the method receiver, not a global alias.
export function read() {
  const self = this;
  const { form: { at } } = self.state;
  return at;
}
