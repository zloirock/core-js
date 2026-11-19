import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.self";
// Long optional tails over a guarded realm leaf hide nothing from usage detection: the realm global
// and the static each navigation reaches pull their modules, whatever spells the root and however long
// the tail after them.
const g = globalThis;
const A = globalThis.window;
export const direct = globalThis.window?.self.Array.from?.alpha?.beta;
export const viaAlias = g.window?.self.Math.trunc.opts?.gamma.delta?.epsilon;
export const viaHeld = A?.self.Object.entries?.zeta.eta?.theta;
export const viaSelf = self.window?.self.String.raw?.iota.kappa.lambda?.mu;