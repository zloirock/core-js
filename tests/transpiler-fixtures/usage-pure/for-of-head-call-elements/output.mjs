import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$is from "@core-js/pure/actual/object/is";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
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
for (const {
  w: {
    entries: viaSole
  }
} of [{
  w: e('a')
}]) _pushMaybeArray(out).call(out, viaSole);
for (const {
  w: {
    entries: viaSibling
  },
  at
} of [{
  w: e('a'),
  at: e('b')
}]) _pushMaybeArray(out).call(out, viaSibling, at);
for (const {
  w: {
    is: viaTwoSameCalls
  }
} of [{
  w: e('a')
}, {
  w: e('b')
}]) _pushMaybeArray(out).call(out, viaTwoSameCalls);
for (const _ref5 of [{
  w: e('a')
}, {
  w: g('b')
}]) {
  const {
      w: _ref4
    } = _ref5,
    viaDifferentCallees = _ref4 === Object ? _Object$is : _ref4.is;
  _pushMaybeArray(out).call(out, viaDifferentCallees);
}
for (const item of [{
  w: e('a')
}]) {
  const {
    w: {
      keys: viaBodyDestructure
    }
  } = item;
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
  const viaWrittenSlot = item.w.entries;
  _pushMaybeArray(out).call(out, viaWrittenSlot);
}
export { out, n };