let at, length;
const readers = [];
for ([{ at, length }] of [[[4, 5]], [[6, 7, 8]]]) readers.push([at.call([9], 0), length]);
export { at, length, readers };
