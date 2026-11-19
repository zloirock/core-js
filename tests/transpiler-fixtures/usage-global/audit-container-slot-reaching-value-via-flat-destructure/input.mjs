// the FLAT destructure spelling over the container member reaches the written value the same way
const cf = { k: Object };
cf.k = Promise;
const { any: viaFlatDestructure } = cf.k;
export { viaFlatDestructure };
