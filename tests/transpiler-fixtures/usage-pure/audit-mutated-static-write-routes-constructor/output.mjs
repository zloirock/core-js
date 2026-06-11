import _Map from "@core-js/pure/actual/map/constructor";
// a monkey-patched static routes EVERY surface through the injected constructor: the write
// patches the ponyfill object and the read sees it there - one object for both, working even
// when the native global is missing on the target
_Map.foo = 123;
export const result = _Map.foo;