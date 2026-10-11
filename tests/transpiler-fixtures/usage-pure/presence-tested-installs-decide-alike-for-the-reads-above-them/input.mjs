// whether an install under a presence test runs is one answer whoever asks it first - a read above the
// installs, or the test of another install - so every read takes the pure import in both legs, through one
// binding per global: two installs guarding each other, and two tests of one global
function useA() { return Promise.resolve(1); }
function useB() { return new Map(); }
if (typeof Promise == 'undefined') globalThis.Map = MapShim;
if (typeof Map == 'undefined') globalThis.Promise = PromiseShim;
export const tag = () => Symbol('tag');
if (!globalThis.Symbol) globalThis.Symbol = SymbolShim;
if (typeof Symbol == 'undefined') globalThis.Symbol = SymbolShim;
export { useA, useB };
