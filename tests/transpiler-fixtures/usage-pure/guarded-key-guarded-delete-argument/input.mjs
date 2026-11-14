// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const obj = { k: 1 };
  const target = { take(x) { effects.push(typeof x);
  return obj;
  } };
  const result = delete target.take((choice ? Object : null)?.fromEntries([])).k;
  return [result, "k" in obj];
}
