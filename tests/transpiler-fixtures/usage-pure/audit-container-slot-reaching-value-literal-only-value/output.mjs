// a written slot bails whatever the value resolves to
const localX = {
  assign: 1
};
const cnc = {
  k: Object
};
cnc.k = localX;
const {
  assign: literalOnlyValue
} = cnc.k;
export { literalOnlyValue };