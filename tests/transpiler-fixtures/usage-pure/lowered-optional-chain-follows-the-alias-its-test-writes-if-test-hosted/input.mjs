export function ifTestHosted() {
  var _t;
  if ((_t = globalThis) == null ? void 0 : _t.self.Symbol.name) return 1;
  return 2;
}
