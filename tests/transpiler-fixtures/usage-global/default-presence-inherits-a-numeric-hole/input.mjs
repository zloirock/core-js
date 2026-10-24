// A hole inside the array length can read an inherited numeric value.
// The Array default must not replace its supplied String receiver.
Array.prototype[0] = 'xy';
const [value = [1]] = [,];
export const result = value.includes('xy');
