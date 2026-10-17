// compound writes are mutations too: both the read half and the write half of `+=` route
// through the injected constructor, and later reads see the accumulated value there
Map.foo = 0;
Map.foo += 1;
export const result = Map.foo;
