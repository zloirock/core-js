import _isIterable from "@core-js/pure/actual/is-iterable";
// usage-pure `Symbol.iterator in obj` where the well-known-Symbol receiver is reached through an
// inlined IIFE proxy-global root (`(() => globalThis)().Symbol.iterator`): the inner proxy global
// must be subsumed by the outer is-iterable rewrite, or the identifier visitor stages a parallel
// `globalThis` rewrite that overlaps the text replacement and crashes the compose. regression lock
const r = _isIterable(obj);
r;