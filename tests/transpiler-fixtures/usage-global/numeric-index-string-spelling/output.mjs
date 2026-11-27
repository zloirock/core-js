import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
type Table = {
  [index: number]: number[];
  [name: string]: number[] | string;
};
export function read(table: Table) {
  return [table['01'].at(0), table['1'].includes(0)];
}