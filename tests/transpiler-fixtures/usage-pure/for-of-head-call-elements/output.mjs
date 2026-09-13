import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A nested loop slot reads statics from the constructors returned by its element calls.
// Equal receivers permit direct extraction; differing callees retain an identity guard.
// Every call and its effects remain in the iterable.
// A member read off the head binding resolves the same receiver.
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
for (const _ref4 of [{
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
for (const _ref5 of [{
  w: e('a')
}, {
  w: e('b')
}]) {
  let viaTwoSameCalls = _Object$is;
  _pushMaybeArray(out).call(out, viaTwoSameCalls);
}
for (const _ref3 of [{
  w: e('a')
}, {
  w: g('b')
}]) {
  let {
      w: _ref2
    } = _ref3,
    viaDifferentCallees = _ref2 === Object ? _Object$is : _ref2.is;
  _pushMaybeArray(out).call(out, viaDifferentCallees);
}
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