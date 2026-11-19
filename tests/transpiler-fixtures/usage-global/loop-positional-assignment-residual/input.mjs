// Each loop iteration assigns the selected array method and its native length from the same element.
// Pure captures the instance receiver; global injection leaves the source assignment in the head.
let at, length;
const readers = [];
for ([{ at, length }] of [[[4, 5]], [[6, 7, 8]]]) readers.push([at.call([9], 0), length]);
export { at, length, readers };
