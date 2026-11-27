declare function append(head: boolean, ...tail: [string, number[]]): void;
export function read(a: Parameters<typeof append>[1], b: Parameters<typeof append>[2]) {
  return [a.at(0), b.includes(7)];
}
