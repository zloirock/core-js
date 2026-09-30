// A const-bound numeric index read accompanies a later nested read of the same constructor slot.
const varIndexOverBail = function () {
  const idxBox = [Object];
  const idx = 0;
  const picked = idxBox[idx];
  const {
    0: {
      keys
    }
  } = idxBox;
  return [picked, keys];
}();
export { varIndexOverBail };