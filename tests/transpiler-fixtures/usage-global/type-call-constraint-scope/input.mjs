// A caller's shadowed alias cannot replace the function declaration's constraint.
type Mode = 'lines' | 'text';
declare function read<T extends Mode>(value: T): { rows: T extends 'lines' ? number[] : string };
export function last() {
  type Mode = {};
  return read('lines').rows.at(-1);
}
