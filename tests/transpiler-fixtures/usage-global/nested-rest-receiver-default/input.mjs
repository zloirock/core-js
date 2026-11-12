// A receiver default below rest still owns its nested static; supplied elements stay native.
function read(...[{ Array: { from } } = globalThis]) {
  return from;
}
const [first, ...[{ Object: { hasOwn } } = globalThis]] = values;
