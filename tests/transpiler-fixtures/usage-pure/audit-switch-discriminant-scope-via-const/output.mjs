import _Map$groupBy from "@core-js/pure/actual/map/group-by";
function viaConst(kind) {
  switch (_Map$groupBy) {
    case 1:
      const Map = kind;
      return Map;
    default:
      return 0;
  }
}
export { viaConst };