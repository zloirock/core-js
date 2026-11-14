// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const list = [1];
  return list[(effects.push(1), (missingPrefix, Symbol)).iterator];
}
