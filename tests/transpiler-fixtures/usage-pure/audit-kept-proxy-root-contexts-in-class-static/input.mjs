class Probe {
  static read() {
    let q;
    return (q = globalThis.window)?.self.Array.prototype.findLast.call([1], it => it);
  }
}
export const inClassStatic = Probe.read();
