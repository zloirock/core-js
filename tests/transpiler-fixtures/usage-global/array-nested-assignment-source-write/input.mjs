// A bodyless assignment reads both nested methods from the original array element.
// Its later initializer may change the source variable before either method is used.
export function read(source, replacement) {
  let values, at;
  if (source) ([{ w: { values }, y: { at } }] = [source, source = replacement]);
  return [values, at];
}
