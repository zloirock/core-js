import "core-js/modules/es.array.push";
// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const Symbol = {
    iterator: "slot"
  };
  const list = {
    slot: 17
  };
  return list[(effects.push(1), effects.push(2), Symbol).iterator];
}