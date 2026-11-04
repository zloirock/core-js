// The prefix must still see the first binding before its own write.
let a, b;
export const result = (({ Map: a, Set: b } = (inspect(a), globalThis)), done());
