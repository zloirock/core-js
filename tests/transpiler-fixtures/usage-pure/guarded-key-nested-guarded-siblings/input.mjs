// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  const effects = [];
  let C = Map;
  if (choice) C = Set;
  const { groupBy, name } = (effects.push(1), (effects.push(2), C));
  return [typeof groupBy, typeof name];
}
