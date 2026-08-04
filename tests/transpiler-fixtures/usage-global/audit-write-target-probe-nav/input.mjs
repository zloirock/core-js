// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
globalThis.writeBox = { n: 1, list: ['ab', 'cd'] };
let held;
export function writes() {
  (globalThis.window?.self.writeBox).n = 2;
  (globalThis.window?.self.writeBox).n += 3;
  (globalThis.window?.self.writeBox).n++;
  --(globalThis.window?.self.writeBox).n;
  (globalThis.window?.self.writeBox).n ??= 9;
  [(globalThis.window?.self.writeBox).n] = [5];
  ({ k: (globalThis.window?.self.writeBox).n } = { k: 6 });
  delete (globalThis.window?.self.writeBox).n;
  for ((globalThis.window?.self.writeBox).n of [1]) break;
  return globalThis.window?.self.writeBox.n;
}

// the same slot behind the two layers this family collapses through: a SEQUENCE and an effectful
// root. the write must still reach the guarded object, and the root effect must run once
export function layeredWrites() {
  ('x', globalThis.window?.self.writeBox).n = 2;
  ('x', globalThis.window?.self.writeBox).n += 3;
  ('x', (held = globalThis)?.window?.self.writeBox).n = 5;
  [('x', globalThis.window?.self.writeBox).n] = [6];
  delete ('x', globalThis.window?.self.writeBox).n;
  ('x', globalThis.window?.self.writeBox).list = globalThis.window?.self.writeBox.list?.at(0);
  return held;
}
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.writeBox.list ? 0 : 1)?.includes('a');
