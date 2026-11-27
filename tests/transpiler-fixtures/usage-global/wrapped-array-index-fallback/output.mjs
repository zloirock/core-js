import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
export function read(rows: Readonly<number[][]>) {
  return (rows[0] ?? 'word').at(-1);
}
export function contains(rows: string[][] | {
  0: string[];
}) {
  const {
    0: item
  } = rows;
  return (item ?? 'word').includes('or');
}