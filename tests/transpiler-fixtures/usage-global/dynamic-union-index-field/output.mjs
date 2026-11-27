import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Row = {
  [name: string]: string;
} | {
  left: number[];
  right: number[];
};
export function read(row: Row, key: 'left' | 'right') {
  return row[key].at(0);
}