// the dead-tail lift drops a sequence tail whose value nothing reads, and usage-global observes it
// only through the import set: each row's own method is its evidence, and the rest sibling, copying
// no static of a constructor core-js does not polyfill, adds none. the lift and the residual read
// are rewrites - the pure sibling is where they are visible
const arr = [1];
export const { of, name } = (0, Array);
export const { at } = (0, arr);
export const { from } = (0, Array);
export const { fromAsync, ...rest } = (0, Array);
