function identity(value) {
  return value;
}
const { Number: { isSafeInteger } } = globalThis, callArgComputed = identity(globalThis)['Set'];
export { isSafeInteger, callArgComputed };
