import _Map from "@core-js/pure/actual/map/constructor";
const forRoot = _Map;
export function viaForInitVarShadow() {
  {
    const forRoot = {};
    for (var forHeld = forRoot; false;) break;
  }
  {
    const {
      groupBy
    } = forHeld;
    return groupBy([], v => v);
  }
}