import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a for-of head over a literal whose elements hold a CALL typed to return a constructor: the leaf
// under the hop reads that constructor's STATIC on every pass (`_Object$entries`), never the
// instance dispatcher that answers `undefined` where the native static is absent. the head binding
// carries no init - the walk reads the iterated element as the init it would have had - and calls of
// the same named function count as one element for a reader that resolves them, while a mirror
// never writes into a call (the source pattern keeps an inline default there). differing callees
// stay generic; a member read off the head binding in the body resolves the same way
let n = 0;
const e = t => {
  n += t.length;
  return Object;
};
const g = t => {
  n += t.length;
  return Array;
};
const out = [];
for (const _ref2 of [{
  w: e('a')
}]) {
  let viaSole = _Object$entries;
  _pushMaybeArray(out).call(out, viaSole);
}
for (const _ref of [{
  w: e('a'),
  at: e('b')
}]) {
  let viaSibling = _Object$entries;
  let {
    at
  } = _ref;
  _pushMaybeArray(out).call(out, viaSibling, at);
}
for (const {
  w: {
    is: viaTwoSameCalls = _Object$is
  }
} of [{
  w: e('a')
}, {
  w: e('b')
}]) _pushMaybeArray(out).call(out, viaTwoSameCalls);
for (const {
  w: {
    is: viaDifferentCallees
  }
} of [{
  w: e('a')
}, {
  w: g('b')
}]) _pushMaybeArray(out).call(out, viaDifferentCallees);
for (const item of [{
  w: e('a')
}]) {
  const viaBodyDestructure = _Object$keys;
  _pushMaybeArray(out).call(out, viaBodyDestructure);
}
for (const item of [{
  w: e('a')
}, {
  w: e('b')
}]) {
  const viaBodyMember = _Object$entries;
  _pushMaybeArray(out).call(out, viaBodyMember);
}
for (const item of [{
  w: Object
}]) {
  item.w = Array;
  const viaWrittenSlot = _entries(item.w);
  _pushMaybeArray(out).call(out, viaWrittenSlot);
}
export { out, n };