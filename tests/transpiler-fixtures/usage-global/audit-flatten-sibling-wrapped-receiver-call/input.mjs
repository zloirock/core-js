function identity(value) {
  return value;
}
const { Array: { isArray } } = globalThis, callArg = identity(globalThis).Promise;
export { isArray, callArg };
