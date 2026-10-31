import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$is from "@core-js/pure/actual/object/is";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
let n = 0;
const e = t => {
  n += t.length;
  return Object;
};
const out = [];
for (const {
  w: {
    values: viaParenHead
  }
} of [{
  w: Object
}]) _pushMaybeArray(out).call(out, viaParenHead);
for (const {
  w: {
    entries: viaDoubleParenHead
  }
} of [{
  w: Object
}]) _pushMaybeArray(out).call(out, viaDoubleParenHead);
for (const {
  w: {
    keys: viaAsConst
  }
} of [{
  w: Object
}] as const) _pushMaybeArray(out).call(out, viaAsConst);
for (const item of [{
  w: Object
}]) {
  const viaParenAlias = _Object$is;
  _pushMaybeArray(out).call(out, viaParenAlias);
}
for (const {
  w: {
    getOwnPropertyDescriptor: viaNonNull
  }
} of [{
  w: Object
}]!) _pushMaybeArray(out).call(out, viaNonNull);
for (const {
  w: {
    getOwnPropertyDescriptors: viaSatisfies
  }
} of [{
  w: Object
}] satisfies unknown) _pushMaybeArray(out).call(out, viaSatisfies);
for (const item of [{
  w: Object
}] as any) {
  const viaAsAnyMember = _Object$fromEntries;
  _pushMaybeArray(out).call(out, viaAsAnyMember);
}
for (const {
  w: {
    getOwnPropertyNames: viaParenCallee
  }
} of [{
  w: e('a')
}, {
  w: e('b')
}]) _pushMaybeArray(out).call(out, viaParenCallee);
export { out, n };