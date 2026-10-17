const arr = [3];
const { [Symbol.iterator]: { name, ...restOfMethod } } = arr;
export { name };
export { restOfMethod };
