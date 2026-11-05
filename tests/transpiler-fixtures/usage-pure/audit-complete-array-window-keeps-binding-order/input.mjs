// Parameter captures read the actual supplied receiver once for each instance leaf.
// A quiet trailing argument element does not change the order of the at and flat reads.
const result = (([{ at }, { flat }]) => [at, flat])([[1], [2], 0]);
export { result };
