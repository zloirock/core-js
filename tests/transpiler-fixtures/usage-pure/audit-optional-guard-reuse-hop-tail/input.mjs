// an INNER maybe-instance dispatch whose chain root is already memoized by an OUTER guard reuses the guard
// ref and stitches the hop tail off it, dropping the redundant `.self` proxy hop (`_ref.self.Array.prototype`
// -> `_ref.Array.prototype`) exactly like the optional-rebind stitch - a raw `.self` reads undefined off-
// engine. NATIVE `Array` has no pure ctor, so the receiver stays a live read off `_ref` (no collapse to a
// binding the guard never proved, no subsuming the kept call's own root rewrite)
export const r = (() => globalThis)()?.self.Array.prototype.flat.call([1, [2]]).join(',');
// the deeper multi-hop tail (`.self.window`) drops both proxy hops the same way
export const d = (() => globalThis)()?.self.window.Array.prototype.flatMap.call([1], n => [n]).join(';');
