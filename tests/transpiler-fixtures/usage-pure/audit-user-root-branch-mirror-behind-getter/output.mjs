// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
const getterRoot = {
  Object,
  get Array() {
    hits++;
    return Array;
  }
};
let getterBind, getterFrom;
({
  Object: {
    keys: {
      [(hits++, 'bind')]: getterBind
    }
  },
  Array: {
    [(hits++, 'from')]: getterFrom
  }
} = getterRoot);
export const behindGetter = [typeof getterBind, typeof getterFrom];