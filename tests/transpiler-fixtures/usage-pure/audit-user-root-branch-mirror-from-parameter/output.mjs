import _keys from "@core-js/pure/actual/instance/keys";
// A user object the receiver walk resolves through its own keys is a mirror root exactly as a pristine proxy global is, under keys
// naming no constructor too: the effect-keyed pattern renders ONCE, off the ponyfills.
let hits = 0;
export function fromParameter(root) {
  var _ref;
  let paramBind, paramFrom;
  _ref = root.Object, {
    [(hits++, 'bind')]: paramBind
  } = _keys(_ref), {
    Array: {
      [(hits++, 'from')]: paramFrom
    }
  } = root;
  return [typeof paramBind, typeof paramFrom];
}