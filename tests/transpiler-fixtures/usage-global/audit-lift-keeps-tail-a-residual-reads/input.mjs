// the dead-tail lift drops a sequence tail whose value nothing reads. a skip-mark alone does not
// prove that: a residual binding still reads the receiver off it, and dropping the tail bound that
// residual off the bare prefix instead (`name` came out undefined). the full-consume rows keep
// their lift, and the rest sibling keeps the whole init
const arr = [1];
export const { of, name } = (0, Array);
export const { at } = (0, arr);
export const { from } = (0, Array);
export const { of: of2, ...rest } = (0, Array);
