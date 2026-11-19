// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const get = () => (effects.push(3), globalThis);
  const it = list[(effects.push(1), (effects.push(2), get()))[(effects.push(4), "Symbol")].iterator];
  return it.call(list).next().value;
}
