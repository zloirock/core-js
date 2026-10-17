// A nested parameter pattern pairs through a pristine inline-array spread.
// Its final quiet receiver can supply a data slot without a deferred accessor.
const array = (([{ at }]) => at)([...[[1, 2]]]);
const string = (([{ includes }]) => includes)([...['ab']]);
export { array, string };
