import _Map from "@core-js/pure/actual/map/constructor";
var M = _Map;
function viaShadow() {
  {
    var M = {
      groupBy() {
        return 'user';
      }
    };
  }
  return M.groupBy(['b'], x => x);
}
export const u = viaShadow();