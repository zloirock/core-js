// A selection default whose left arm is a realm read of a global the build leaves to the engine, carrying a
// same-named static of its own (`Float16Array.from`): an engine lacking it runs the right, whose static keeps
// its module (`Array.from`)
export function read({ from } = globalThis.Float16Array ?? Array) {
  return from;
}
