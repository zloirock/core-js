import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const obj = {
    k: 1
  };
  const result = delete ((choice ? Object : null)?.fromEntries([["k", obj]]) as any).k.k;
  return [result, "k" in obj];
}