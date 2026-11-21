function identity(value) {
  return value;
}
const { Object: { freeze } } = globalThis, callArgStatic = identity(globalThis).Object.fromEntries([]);
export { freeze, callArgStatic };
