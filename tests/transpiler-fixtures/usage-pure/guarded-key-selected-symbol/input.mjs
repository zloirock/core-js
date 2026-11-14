// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const list = [1];
  return ((effects.push("choose"), choice) ? globalThis : self).Symbol.iterator in list;
}
