// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
function run({ x: { from = [] } = Array, ...rest } = {}) {
  return [from([1]), rest];
}
function emit({ y: { of = () => null } = Array, ...rest } = {}) {
  return [of(2, 3), rest];
}
export { run, emit };
