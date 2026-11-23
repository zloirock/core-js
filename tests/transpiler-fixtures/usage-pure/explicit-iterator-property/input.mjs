// The user's iterator property keeps its value and its receiver.
export const direct = ({ [Symbol.iterator]: null })[Symbol.iterator];
export const { w: { [Symbol.iterator]: { n = 3 } } } = { w: { [Symbol.iterator]: false } };
export function call() {
  const array = [];
  array[Symbol.iterator] = false;
  return array[Symbol.iterator]?.();
}
export function readUnknown(value) {
  return value[Symbol.iterator];
}
