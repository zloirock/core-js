import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
function viaOpaqueKey(o) {
  const {
    p: {
      Set: S,
      Array: {
        of
      }
    } = {
      Set: _Set,
      Array: {
        of: _Array$of
      }
    }
  } = o;
  return [S, of(7)];
}
function viaOpaqueTwoLevels(o) {
  const [{
    k: {
      Set: S,
      Array: {
        of
      }
    } = {
      Set: _Set,
      Array: {
        of: _Array$of
      }
    }
  } = {}] = o;
  return [S, of(7)];
}
export const opaqueDeep = [viaOpaqueKey({}), viaOpaqueTwoLevels([])];