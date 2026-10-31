// an array level holding a selection the build decides is the array it always yields, so the element
// pattern reads its static off that array: declared, assigned, a parameter default, a for-of head
// and a nested level
export const [{ groupBy }] = typeof Symbol != 'undefined' ? [Map] : [Object];
let withResolvers;
[{ withResolvers }] = typeof Symbol != 'undefined' ? [Promise] : [Object];
export { withResolvers };
export function viaParam([{ fromAsync }] = typeof Symbol != 'undefined' ? [Array] : [Object]) {
  return fromAsync;
}
for (const [{ from }] of [typeof Symbol != 'undefined' ? [Iterator] : [Object]]) console.log(from);
export const [[{ canParse }]] = [typeof Symbol != 'undefined' ? [URL] : [Object]];
