// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const { [(effects.push(1), (effects.push(2), Symbol)).iterator]: it } = list;
  return it.call(list).next().value;
}
