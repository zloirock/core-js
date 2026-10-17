function returned() {
  return globalThis.window?.self.Array.of(2).keys();
}
export const returnedValue = returned().next().value;
