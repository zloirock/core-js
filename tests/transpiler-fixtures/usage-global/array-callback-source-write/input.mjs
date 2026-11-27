const items = ['word'];
items.forEach((value, index, source) => { source[index] = [7]; });
export const first = items[0].at(0);
export function throughHolder() {
  const source = ['word'];
  const holder = { rows: source };
  source.forEach((value, index, row) => { row[index] = ['needle']; });
  return holder.rows[0].includes('needle');
}
