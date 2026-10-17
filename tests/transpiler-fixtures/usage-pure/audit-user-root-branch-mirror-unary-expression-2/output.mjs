import _Array$from from "@core-js/pure/actual/array/from";
// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
const src = {
  Object,
  Array
};
let capturedBind, capturedFrom;
const captured = (src, {
  Object: {
    keys: {
      [(hits++, 'bind')]: capturedBind
    }
  }
} = src, {
  Array: {}
} = src, hits++, capturedFrom = _Array$from, src);
export const yielded = [typeof capturedFrom];