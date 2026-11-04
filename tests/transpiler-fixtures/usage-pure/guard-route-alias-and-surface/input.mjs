const realm = globalThis;
export function read(effect) {
  let held;
  return [(held = realm).window.field, (effect(), realm).window.field, window?.self.value.at(0), window?.window.value.at(0)];
}
