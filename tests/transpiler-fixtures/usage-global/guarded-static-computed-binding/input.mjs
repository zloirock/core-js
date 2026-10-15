// A constant computed key names the same guarded static as a plain key.
// Each source slot is read once and keeps its position in the pattern.
let M = pickConstructor();
if (!M) M = Array;
const key = 'of';
const { from, [key]: method } = M;
export { from, method };
