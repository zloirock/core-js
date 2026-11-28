import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const box: {
  v: any;
} = {
  v: [5]
};
const other = {
  v: [7]
};
function read(flag: boolean): {
  v: number[];
};
function read(flag: boolean): any {
  return flag ? box : other;
}
box.v = 'xy';
export function first(flag: boolean) {
  return read(flag).v.at(0);
}