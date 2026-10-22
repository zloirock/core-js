// Parameter instance reads capture the supplied or default positional receiver once.
// An unrelated native-only pattern keeps its original spelling.
function viaParamDefault([{ y: { at: a } }] = [...[nb]]) { return a; }
class K { f = (([{ y: { at: b } }]) => b)([...[nb]]); }
const [{ z }] = [...[nb]];
export { viaParamDefault, K, z };
