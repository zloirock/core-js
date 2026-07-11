// an init that peels (TS cast / parens) to a bare Identifier is freely re-referenceable:
// both emitters REUSE the identifier instead of memoizing the wrapped init (the unified
// receiver plan decides once for both; babel used to pre-memo `_ref = arr as any` here)
var { [(k1(), 'at')]: a, other } = arr as any;
var { [(k2(), 'flat')]: f, more } = (arr2);
// an SE-crossed peel is NOT a bare reuse: the whole-init memo keeps the prefix in order
var { [(k3(), 'includes')]: inc, rest } = (se1(), arr3) as any;
export const r = [a, f, inc, other, more, rest];
