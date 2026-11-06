// A partial mirror keeps the selected receiver and the disabled property on a second pass.
export function read({ box: { marker = -1, at } } = { box: null ?? source() }) {
  return [marker, at];
}
export function statics({
  Array: {
    from,
    // core-js-disable-next-line
    of,
  },
} = globalThis) { return [from, of]; }
