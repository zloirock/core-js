// A nested parameter pattern consumes an inline-array spread once.
// Its supplied receiver determines the instance dispatch at body entry.
const array = (([{ at }]) => at)([...[[1, 2]]]);
const string = (([{ includes }]) => includes)([...['ab']]);
export { array, string };
