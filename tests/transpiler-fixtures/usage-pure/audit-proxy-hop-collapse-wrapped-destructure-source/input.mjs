// A proxy-global chain that is a destructure SOURCE - wrapped in ANY value carrier (a leading side-
// effect sequence, a conditional, or a TS cast) - is owned by the destructure path, which feeds its
// props into a synth literal (`{ from: _Array$from }`). the expression-level proxy-hop collapse must NOT
// also fire there: it climbs every value carrier to the binding context and skips on the pattern target.
// were it to fire, the consumed-and-dropped receiver would leak a dead `_globalThis` import. NO
// `_globalThis` is expected - every prop resolves to a pure static and the receiver is fully consumed.
function eff() {}
function seSource({ from, of } = (eff(), globalThis.window.self.Array)) {
  return from([1]) + of(2, 3);
}
const useGlobal = 1;
const objFallback = { fromEntries() {} };
const { fromEntries } = useGlobal ? globalThis.self.Object : objFallback;
const { getOwnPropertyDescriptors } = (globalThis.self.Object as any);
getOwnPropertyDescriptors({ a: 1 });
export { seSource, fromEntries };
