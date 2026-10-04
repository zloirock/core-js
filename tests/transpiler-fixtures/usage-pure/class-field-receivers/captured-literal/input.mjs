// A field's destructuring assignment retains its literal receiver before the effectful key.
// Both claimed methods read that receiver and the field keeps the original assignment value.
let at;
let flat;
let keys = 0;
class Box {
  value = ({ [(keys++, 'at')]: at, flat } = [1, [2]]);
}
const box = new Box();
export const result = [at.call(box.value, 0), flat.call(box.value), keys];
