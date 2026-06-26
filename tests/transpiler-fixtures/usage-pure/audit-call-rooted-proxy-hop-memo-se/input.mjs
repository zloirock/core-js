// A destructure-default receiver rooted in an SE-bearing CALL through a proxy-global hop, forced through
// the MEMO path by an unresolved sibling key (`length` is not a polyfilled static, so the pattern can't be
// statically extracted). The collapse drops the `.self` hop and re-roots on the pure global, so EVERY effect
// the dropped prefix carried - the chain-root call AND a computed hop-key effect - must re-emit as a sequence
// prefix. Harvesting only the chain-root call dropped a buried hop-key effect on babel. distinct sibling key
// per line so each polyfill import attributes to its line.
let c = 0;
function rootCall({ of, length } = (() => {
  c++;
  return globalThis;
})().self.Array) {
  return [of(1), length];
}
function hopAndRootCall({ from, name } = (() => {
  c += 10;
  return globalThis;
})()[(c++, 'self')].Array) {
  return [from([1]), name];
}
// BARE proxy-global root (no chain-root call) with a SE-bearing hop key: maximalProxyGlobalPrefix bails on
// the SE hop, so the unplugin root-swap must instead route through the call-rooted collapse to harvest the
// hop-key effect and drop the dead `.self` - non-pure leaf re-roots, pure-ctor leaf whole-swaps.
function bareRootNonPure({ of, byteLength } = globalThis[(c += 100, 'self')].Array) {
  return [of(1), byteLength];
}
function bareRootCtor({ get, size } = globalThis[(c += 1000, 'self')].Map) {
  return [get, size];
}
export { rootCall, hopAndRootCall, bareRootNonPure, bareRootCtor, c };
