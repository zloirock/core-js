import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
  w: Object
}]) out.push(viaParenHead);
for (const {
  w: {
    entries: viaDoubleParenHead
  }
} of [{
  w: Object
}]) out.push(viaDoubleParenHead);
for (const {
  w: {
    keys: viaAsConst
  }
} of [{
  w: Object
}] as const) out.push(viaAsConst);
for (const item of [{
  w: Object
}]) {
  const {
    is: viaParenAlias
  } = item.w;
  out.push(viaParenAlias);
}
for (const {
  w: {
    getOwnPropertyDescriptor: viaNonNull
  }
} of [{
  w: Object
}]!) out.push(viaNonNull);
for (const {
  w: {
    defineProperties: viaSatisfies
  }
} of [{
  w: Object
}] satisfies unknown) out.push(viaSatisfies);
for (const item of [{
  w: Object
}] as any) {
  const viaAsAnyMember = item.w.fromEntries;
  out.push(viaAsAnyMember);
}
for (const item of [{
  w: Object
}]) {
  item.w = Array;
  const viaParenWrittenSlot = item.w.assign;
  out.push(viaParenWrittenSlot);
}
for (const {
  w: {
    getOwnPropertyNames: viaParenCallee
  }
} of [{
  w: e('a')
}, {
  w: e('b')
}]) out.push(viaParenCallee);
export { out, n };