function identity(value) {
  return value;
}
const { Object: { keys } } = globalThis, unclaimed = identity(globalThis).noSuchThing;
export { keys, unclaimed };
