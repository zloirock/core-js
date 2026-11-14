// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  let C = Map;
  if (choice) C = Set;
  const { groupBy } = (effects.push(1), (effects.push(2), C));
  return typeof groupBy;
}
