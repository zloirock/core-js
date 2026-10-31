// A nested name read keeps the iterator function name available.
const { [Symbol.iterator]: { name: iterName }, second } = [4, 5];
export const viaLiteralNoDefault = [iterName, second];
