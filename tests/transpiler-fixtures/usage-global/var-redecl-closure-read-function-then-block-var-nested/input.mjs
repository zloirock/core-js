function functionThenBlockVarNested() {
  function a() {}
  function g() { return a.some(Boolean); }
  { var a = [3, 4].values(); }
  return g();
}
export const r = [functionThenBlockVarNested()];
