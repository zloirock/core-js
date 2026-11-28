import _at from "@core-js/pure/actual/instance/at";
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
  var _ref;
  return _at(_ref = read(flag).v).call(_ref, 0);
}