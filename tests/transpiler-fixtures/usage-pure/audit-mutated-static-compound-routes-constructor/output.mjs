import _Map from "@core-js/pure/actual/map/constructor";
// compound writes are mutations too: both the read half and the write half of `+=` route
// through the injected constructor, and later reads see the accumulated value there
_Map.foo = 0;
_Map.foo += 1;
export const result = _Map.foo;