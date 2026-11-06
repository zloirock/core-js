// a TS-cast (or paren / non-null) wrapper around the method callee must still be recognized as
// an optional method call: peel the transparent wrapper so the call routes through
// `_ref.call(recv)` and keeps `this` (after TS erasure this is `obj.getArr?.()`, binding obj)
(obj.getArr as any)?.().at(0);
