// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
globalThis.writeBox = { n: 1, list: ['ab', 'cd'] };
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
