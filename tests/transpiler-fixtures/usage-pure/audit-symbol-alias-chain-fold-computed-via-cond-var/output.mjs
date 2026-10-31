import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: a conditionally-initialized hoisted `var` key binds everywhere but holds the
// string only on the taken path - the untaken path captures globalThis[undefined], so the
// chain must stay raw (the dominance gate anchors at the capture, not the eventual use)
if (cond) var ku = 'Symbol';
const {
  [ku]: CondVarSymbol
} = _globalThis;
const {
  iterator: viaCondVar = fb
} = CondVarSymbol;
export const u = [33, 34][viaCondVar];