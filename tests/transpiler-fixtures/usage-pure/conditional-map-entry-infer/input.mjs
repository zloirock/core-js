// Map iterates pairs, so its inferred element cannot satisfy a string constraint.
type Result<T> = T extends Iterable<infer U extends string> ? string : number[];
export function read(value: Result<Map<string, number>>) {
  return value.at(0);
}
export const result = read([7]);
