import _includes from "@core-js/pure/actual/instance/includes";
// An assignment default contributes a family that the source field may never hold.
// Deferred reads must retain the String path selected by that default.
const flag = false;
const box = {
  data: flag ? [10, 20] : undefined
};
let data = Math;
({
  data = '1020'
} = box);
function read() {
  return _includes(data).call(data, '02');
}
export const result = read();