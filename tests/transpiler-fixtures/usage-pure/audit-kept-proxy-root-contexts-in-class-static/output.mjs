import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
class Probe {
  static read() {
    let q;
    return null == (q = _globalThis.window) ? void 0 : _findLastMaybeArray(q.Array.prototype).call([1], it => it);
  }
}
export const inClassStatic = Probe.read();