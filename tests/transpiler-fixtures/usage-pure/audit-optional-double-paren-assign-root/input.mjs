// DOUBLE-paren-wrapped assignment as the root of an optional proxy chain. the AST emitter reprints
// no redundant parens, so the guard root `_ref = ...` must spell the bare assignment (`n = gw`), NOT
// keep a leftover paren (`(n = gw)`) - a paren nest that bottoms out at a plain expression peels FULLY,
// matching babel. contrast the single-paren line: it already peeled, and the doubled ones now match it.
// a `.name` (MaybeFunction get) tail routes through the guard-root speller; distinct ctor + method per line.
let n, s, w;
const gw = globalThis;
export const doubleMapHas = ((n = gw))?.self.Map.prototype.has.name;
export const doubleSetAdd = ((s = gw))?.self.window.Set.prototype.add.name;
export const singleWeakGet = (w = gw)?.self.WeakMap.prototype.get.name;
