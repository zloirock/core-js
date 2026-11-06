// proxy-global static optional calls resolve through the SAME canonical chain resolver the emit side
// uses, so EVERY proxy-global form deopts to the always-defined static (not a guarded native member):
// a const-alias of the global, a nested proxy chain, and a computed proxy base. before delegating to
// the shared resolver, only the single-level bare-base form deopted and these collided into `_X$callcall`
const g = globalThis;
export const a = g.Array.from?.().at(0);
export const b = globalThis.self.Array.of?.().flat();
export const c = globalThis['Promise'].resolve?.().then(x => x);
