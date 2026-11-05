import _globalThis from "@core-js/pure/actual/global-this";
// Parentheses and sequences preserve the value captured by an array-wrapper alias.
// The nested statics stay native, including the uncertain position after a spread.
const [parenElement] = [[_globalThis]];
export const [{
  Object: {
    fromEntries: viaParenElement
  }
}] = parenElement;
const [parenInit] = [[_globalThis]];
export const [{
  Object: {
    groupBy: viaParenInit
  }
}] = parenInit;
let seq = 0;
const [seqInit] = (seq++, [[_globalThis]]);
export const [{
  Array: {
    from: viaSeqInit
  }
}] = seqInit;
const xs = [];
const [spreadUnderParen] = [...xs, [_globalThis]];
export const [{
  Object: {
    assign: staysNative
  }
}] = spreadUnderParen;
export const results = [viaParenElement([["k", 1]]), viaParenInit([2], x => x), viaSeqInit([3]), staysNative({}, {
  a: 4
})];