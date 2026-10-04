// A nullable array-producing call in an instance field can yield null.
// Capturing that receiver throws before its computed key while initializing the field.
let at;
let flat;
let keys = 0;
function built() {
  return JSON.parse('true') ? null : [1, [2]];
}
class Box {
  value = ({ [(keys++, 'at')]: at, flat } = built());
}
export const result = (() => {
  try {
    new Box();
  } catch (error) {
    return [error instanceof TypeError, keys];
  }
})();
