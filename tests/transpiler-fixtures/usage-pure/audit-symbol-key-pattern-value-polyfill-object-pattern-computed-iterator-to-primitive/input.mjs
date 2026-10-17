// a computed well-known-symbol key INSIDE the extracted pattern stays live and substitutes
const { [Symbol.iterator]: { [Symbol.toPrimitive]: tp } } = [1];
export { tp };
