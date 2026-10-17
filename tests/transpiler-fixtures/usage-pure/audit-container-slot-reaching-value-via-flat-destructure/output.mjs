import _Promise from "@core-js/pure/actual/promise";
// the FLAT destructure spelling over the written container member bails like the nested one
const cf = {
  k: Object
};
cf.k = _Promise;
const {
  any: viaFlatDestructure
} = cf.k;
export { viaFlatDestructure };