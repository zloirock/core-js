// TS instantiation expression `f<T>` followed by a runtime call: the type-arg block is
// stripped and the call is rewritten like any other call site.
const map = new Map<string, number>();
map.entries();
