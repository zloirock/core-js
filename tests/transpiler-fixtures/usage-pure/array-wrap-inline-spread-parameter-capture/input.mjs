// Parameter instance leaves capture their supplied or defaulted receiver from the spread array.
// The separate native z pattern retains its own array iteration.
function viaParamDefault([{ y: { at: a } }] = [...[nb]]) { return a; }
class K { f = (([{ y: { at: b } }]) => b)([...[nb]]); }
const [{ z }] = [...[nb]];
export { viaParamDefault, K, z };
