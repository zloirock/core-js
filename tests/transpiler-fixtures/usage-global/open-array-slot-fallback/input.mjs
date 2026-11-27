export function first(rows: number[][]) { return (rows[0] ?? 'fallback').at(0); }
export function read(rows: string[][]) {
  const [value] = rows;
  return (value ?? 'fallback').includes('back');
}
