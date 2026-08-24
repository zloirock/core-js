// an SE-keyed hop the pure package cannot back (`window`) must survive the spine collapse
// in every position: the read - and the null probe over its stored value - discriminates
// window-less realms, and folding it onto the root would hand the probe an always-defined
// ponyfill
function eff(t) {
  return t;
}
let x;
export const stored = globalThis[eff('a'), 'window'];
export const probed = (x = globalThis[eff('b'), 'window']) == null ? void 0 : x.self.Array;
// ... and the dotted twins: a backed hop BELOW the unbacked terminal stays a real read too
// (folding `self` under the terminal `window` would erase the throw a self-less realm owes),
// while a backed TERMINAL still folds (the deep-nav realm collapse)
export const dottedTail = globalThis.self.window;
export const seqAfterBacked = globalThis[eff('c'), 'self'][eff('d'), 'window'];
export const backedTerminal = globalThis.window.self;
export const keep = [1].at(0);
