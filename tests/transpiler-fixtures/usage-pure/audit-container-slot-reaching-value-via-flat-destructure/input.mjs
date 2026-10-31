// the FLAT destructure spelling over the written container member bails like the nested one
const cf = { k: Object };
cf.k = Promise;
const { any: viaFlatDestructure } = cf.k;
export { viaFlatDestructure };
