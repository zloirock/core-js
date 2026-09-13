// Literal receivers with computed keys preserve receiver, key, property, and sibling order.
// Ordinary and for-init var declarations keep the entire sequence in their source slot.
// Each key effect and property read runs once.
let k = 0;
var { [(k++, 'at')]: a, other } = [7, 8], z = 1;
for (var { [(k++, 'flat')]: f, other2 } = [[1], 2], i = 0; i < 1; i++) console.log(f);
var { [(k++, 'includes')]: inc, other3 } = [5, 6];
console.log(a, z, inc, k, other, other2, other3);
