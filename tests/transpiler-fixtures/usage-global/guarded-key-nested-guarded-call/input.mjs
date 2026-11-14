// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  let C = Map;
  if (choice) C = Set;
  return (effects.push(1), (effects.push(2), C)).groupBy([1, 2], x => x % 2).size;
}
