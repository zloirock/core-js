import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
const src = {
  Object,
  Array
};
let bind, from;
({
  Object: {
    keys: {
      [(hits++, 'bind')]: bind
    }
  },
  Array: {
    [(hits++, 'from')]: from
  }
} = {
  Object: {
    keys: _Object$keys
  },
  Array: {
    from: _Array$from
  }
});
export const mirrored = [typeof bind, typeof from, hits];