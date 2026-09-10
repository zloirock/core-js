// the dead-tail lift drops a sequence tail whose value nothing reads, and usage-global observes it
// only through the import set: each row's own family is its evidence, and the rest sibling keeps the
// whole init of the global it names. the lift and the residual read are rewrites - the pure sibling
// is where they are visible
const arr = [1];
export const { of, name } = (0, Array);
export const { at } = (0, arr);
export const { from } = (0, Array);
export const { of: of2, ...rest } = (0, Array);
