// NEGATIVE: a computed hop key cannot be walked - the chain is unresolvable
const { [k]: { [Symbol.iterator]: viaComputed } } = obj;
export { viaComputed };
