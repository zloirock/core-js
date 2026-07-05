// `Array#find` returns `element | undefined` per spec, so `??` may yield the string
// fallback: the element narrow is marked (nullable in known-built-in-return-types) and
// must dispatch generically, not through an array-Maybe. the `.find` call itself keeps
// the array-Maybe on its own receiver
declare const a: number[][];
(a.find(v => v.length > 0) ?? 'fallback').at(0);
