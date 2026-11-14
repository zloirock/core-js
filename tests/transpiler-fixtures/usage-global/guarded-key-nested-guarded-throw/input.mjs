// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  let C = Map;
  if (choice) C = Set;
  return (effects.push(1), (missingPrefix, C)).groupBy;
}
