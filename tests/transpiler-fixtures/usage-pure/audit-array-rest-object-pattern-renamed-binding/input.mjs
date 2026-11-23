// The rest binding receives a new array with its own length.
const arr = [1, 2, 3, 4];
const [first, ...{ length: rest }] = arr;
export { first, rest };
