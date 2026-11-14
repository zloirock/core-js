// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const obj = { k: 1 };
  const result = delete (choice ? Object : null)?.fromEntries((effects.push("args"), [["k", obj]])).k[(effects.push("key"), "k")];
  return [result, "k" in obj];
}
