// param destructure default with logical `Array || Iterator`: each branch must emit
// its own polyfill alias (Array.from when left is truthy, Iterator.from when left is
// nullish), so the call dispatches correctly regardless of which branch wins at runtime
function f({ from } = Array || Iterator) {
  return from([1]);
}
export { f };
