import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a for-of head whose iterated LITERAL stands behind a wrapper - parentheses, a TS assertion - that
// one parser keeps as a node and the other drops: every reader of the head (the pattern in the head,
// the alias bound by the head, the census that keys the head's element as a container) reads the
// same elements through the wrapper, so the leaf resolves to the constructor's STATIC on both legs
// rather than to the instance dispatcher, and the global flavor injects the static's own module.
// a parenthesized CALLEE in a same-callee element list is the same wrapper one level down. one static
// per row: the global flavor is read by its import set, where two rows on one method mask each other
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
  w: {
    values: _Object$values
  }
}]) _pushMaybeArray(out).call(out, viaParenHead);
for (const {
  w: {
    entries: viaDoubleParenHead
  }
} of [{
  w: {
    entries: _Object$entries
  }
}]) _pushMaybeArray(out).call(out, viaDoubleParenHead);
for (const {
  w: {
    keys: viaAsConst
  }
} of [{
  w: {
    keys: _Object$keys
  }
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
  w: {
    getOwnPropertyDescriptor: _Object$getOwnPropertyDescriptor
  }
}]!) _pushMaybeArray(out).call(out, viaNonNull);
for (const {
  w: {
    defineProperties: viaSatisfies
  }
} of [{
  w: {
    defineProperties: _Object$defineProperties
  }
}] satisfies unknown) _pushMaybeArray(out).call(out, viaSatisfies);
for (const item of [{
  w: Object
}] as any) {
  const viaAsAnyMember = _Object$fromEntries;
  _pushMaybeArray(out).call(out, viaAsAnyMember);
}
for (const item of [{
  w: Object
}]) {
  item.w = Array;
  const viaParenWrittenSlot = item.w.assign;
  _pushMaybeArray(out).call(out, viaParenWrittenSlot);
}
for (const {
  w: {
    getOwnPropertyNames: viaParenCallee = _Object$getOwnPropertyNames
  }
} of [{
  w: e('a')
}, {
  w: e('b')
}]) _pushMaybeArray(out).call(out, viaParenCallee);
export { out, n };