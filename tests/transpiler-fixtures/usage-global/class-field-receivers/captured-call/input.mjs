// A field's destructuring assignment evaluates its array-producing call once before the key.
// Both claimed methods read that receiver and the field keeps the original assignment value.
let at;
let flat;
let calls = 0;
let keys = 0;
function built() {
  return [++calls, [2]];
}
class Box {
  value = ({ [(keys++, 'at')]: at, flat } = built());
}
const box = new Box();
export const result = [at.call(box.value, 0), flat.call(box.value), calls, keys];
