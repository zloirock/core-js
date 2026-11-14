// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const it = list[(effects.push(1), (effects.push(2), Symbol)).iterator];
  return it.call(list).next().value;
}
