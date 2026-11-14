// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const obj = { k: 1 };
  const result = delete (choice ? Object : null)?.fromEntries([["k", obj]])!.k.k;
  return [result, "k" in obj];
}
