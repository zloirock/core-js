// A local object's same-named slot can be missing; its default stays live.
export function read(self) {
  const { w: { at } = [11] } = { w: self.self };
  return at;
}
