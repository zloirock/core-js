// An iterator slot keyed with an effect over an array literal memoizes the literal and runs the effect where
// the source wrote it, ahead of the iterator method the nested level reads its name off.
const { [(se(), Symbol.iterator)]: { name } } = [1, 2];
export { name };
