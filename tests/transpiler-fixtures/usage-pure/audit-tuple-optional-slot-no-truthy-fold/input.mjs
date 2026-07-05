// a tuple optional slot (`[T?]`) admits undefined: `??` on the element may yield the
// string fallback and must dispatch generically, not through an array-Maybe
declare const t: [number[]?];
(t[0] ?? 'fallback').at(0);
