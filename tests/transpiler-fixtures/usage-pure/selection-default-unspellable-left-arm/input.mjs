// A selection default whose left arm is a realm read of a global the build leaves to the engine, carrying a
// same-named static with no pure entry of its own (`Float16Array.from`): the mirror cannot spell that arm, so
// pure leaves every arm native (an accepted boundary)
export function read({ from } = globalThis.Float16Array ?? Array) {
  return from;
}
