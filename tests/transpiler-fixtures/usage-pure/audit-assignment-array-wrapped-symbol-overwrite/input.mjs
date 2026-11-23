// Object rest excludes the original key. The iterator symbol is rewritten in the native pattern.
let it, r;
[{ [Symbol.iterator]: it, ...r }] = [arr];
it;
r;
