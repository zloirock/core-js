// an INNER maybe-instance dispatch whose chain root is already memoized by an OUTER guard
// reuses the guard ref and stitches the RAW hop tail off it (`_ref.self...`): a hop collapse
// would read a binding the guard never proved and subsume the kept call's own root rewrite
export const r = (() => globalThis)()?.self.Array.prototype.flat.call([1, [2]]).join(',');
// the deeper multi-hop tail stitches the same way
export const d = (() => globalThis)()?.self.window.Array.prototype.flatMap.call([1], n => [n]).join(';');
