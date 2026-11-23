// The rest binding receives a new array with its own length.
const arr = [1, 2, 3];
const [...{
  length
}] = arr;
export { length };