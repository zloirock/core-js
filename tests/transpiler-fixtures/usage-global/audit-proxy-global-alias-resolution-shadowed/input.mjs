import gS = require("@core-js/pure/actual/global-this");
export function shadowed() {
  const gS = { Object: { fromEntries: (x: Iterable<[string, number]>) => x } };
  return gS.Object.fromEntries([['a', 1]]);
}
