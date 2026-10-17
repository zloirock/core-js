var { Map: M } = globalThis;
function viaShadow() {
  { var M = { groupBy() { return 'user'; } }; }
  return M.groupBy(['b'], x => x);
}
export const u = viaShadow();
