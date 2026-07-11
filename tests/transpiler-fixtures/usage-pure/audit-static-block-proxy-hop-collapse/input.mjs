// a proxy-hop chain inside a class `static {}` block collapses like any statement-list
// host: the redundant `.self` hop folds and the static-call leaf swaps to the pure binding
class Boot {
  static tag = null;
  static { Boot.tag = globalThis.self.Array.from([1, 2]); }
}
export const r = Boot.tag;
