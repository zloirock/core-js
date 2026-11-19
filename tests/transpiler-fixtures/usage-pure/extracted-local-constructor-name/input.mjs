// An extracted method named like a global constructor remains the local method.
export function read(row) {
  const { at: Map, flat } = row;
  return [Map.call(row, -1), typeof flat];
}
