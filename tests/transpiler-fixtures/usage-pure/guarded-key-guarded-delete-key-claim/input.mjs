// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  const effects = [];
  const obj = { k: 1 };
  const result = delete (choice ? Object : null)?.fromEntries([["k", obj]]).k[(effects.push([7].at(-1)), "k")];
  return [result, "k" in obj];
}
