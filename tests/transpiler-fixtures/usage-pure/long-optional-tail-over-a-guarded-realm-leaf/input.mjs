// A guard over a realm leaf pulls its tail in by the shared rule: the `?.` reading the ponyfill folds
// in, plain reads keep pulling, and a later `?.` over a value that can be absent stays outside on the
// guard's own value - over a long tail, and whatever spells the root.
const g = globalThis;
const A = globalThis.window;
export const direct = globalThis.window?.self.box?.alpha?.beta;
export const viaAlias = g.window?.self.cfg.opts?.gamma.delta?.epsilon;
export const viaHeld = A?.self.api?.zeta.eta?.theta;
export const viaSelf = self.window?.self.store?.iota.kappa.lambda?.mu;
